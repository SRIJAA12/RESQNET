from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.inventory import InventoryItem, InventoryMovement, MovementTypeEnum, ItemCategoryEnum
from app.schemas.inventory import (
    InventoryItemCreate,
    InventoryItemResponse,
    InventoryItemUpdateQuantity,
    InventoryMovementResponse
)
from app.schemas.common import APIResponse, PaginatedResponse, PaginationMeta
from app.repositories.audit_repo import AuditRepository
from app.core.security import get_current_user, require_role, AuthUser

router = APIRouter(prefix="/inventory", tags=["Inventory & Relief Supplies"])


@router.get("", response_model=PaginatedResponse[InventoryItemResponse])
def list_inventory_items(
    category: Optional[str] = Query(None, description="Filter by category (water, dry_ration, medical_kit, etc.)"),
    search: Optional[str] = Query(None, description="Search item name"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(InventoryItem)
    if category and category.lower() != "all":
        try:
            cat_enum = ItemCategoryEnum(category.lower())
            query = query.filter(InventoryItem.category == cat_enum)
        except ValueError:
            pass
    if search:
        query = query.filter(InventoryItem.item_name.ilike(f"%{search}%"))

    total_count = query.count()
    skip = (page - 1) * page_size
    items = query.order_by(InventoryItem.item_name.asc()).offset(skip).limit(page_size).all()
    total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 1

    return PaginatedResponse(
        items=[InventoryItemResponse.model_validate(i) for i in items],
        pagination=PaginationMeta(
            total_count=total_count,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    )


@router.get("/{item_id}", response_model=APIResponse[InventoryItemResponse])
def get_inventory_item(
    item_id: str,
    db: Session = Depends(get_db)
):
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inventory item '{item_id}' was not found."
        )
    return APIResponse(
        success=True,
        data=InventoryItemResponse.model_validate(item)
    )


@router.post("", response_model=APIResponse[InventoryItemResponse], status_code=status.HTTP_201_CREATED)
def create_inventory_item(
    item_in: InventoryItemCreate,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("dispatcher"))
):
    item = InventoryItem(
        item_name=item_in.item_name,
        category=item_in.category,
        quantity=item_in.quantity,
        unit=item_in.unit,
        reorder_threshold=item_in.reorder_threshold,
        shelter_id=item_in.shelter_id
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    # Initial movement record
    if item.quantity > 0:
        movement = InventoryMovement(
            inventory_item_id=item.id,
            movement_type=MovementTypeEnum.INBOUND,
            quantity=item.quantity,
            reference="INITIAL_STOCK",
            performed_by_user_id=current_user.user_id,
            notes="Initial stock registration"
        )
        db.add(movement)
        db.commit()

    AuditRepository(db).record_event(
        entity_type="inventory",
        entity_id=item.id,
        action="inventory_item_created",
        performed_by=current_user.email,
        changes={"item_name": item.item_name, "quantity": item.quantity}
    )

    return APIResponse(
        success=True,
        message="Inventory item registered successfully",
        data=InventoryItemResponse.model_validate(item)
    )


@router.patch("/{item_id}/quantity", response_model=APIResponse[InventoryItemResponse])
def update_inventory_quantity(
    item_id: str,
    update_in: InventoryItemUpdateQuantity,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("dispatcher"))
):
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).with_for_update().first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inventory item '{item_id}' was not found."
        )

    new_quantity = item.quantity + update_in.delta
    if new_quantity < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient stock: Cannot reduce by {abs(update_in.delta)}. Current quantity is {item.quantity} {item.unit}."
        )

    prev_qty = item.quantity
    item.quantity = new_quantity

    movement_type = MovementTypeEnum.INBOUND if update_in.delta > 0 else MovementTypeEnum.OUTBOUND
    movement = InventoryMovement(
        inventory_item_id=item.id,
        movement_type=movement_type,
        quantity=abs(update_in.delta),
        reference=update_in.reference or "MANUAL_ADJUSTMENT",
        performed_by_user_id=current_user.user_id,
        notes=update_in.reason or f"Stock adjustment by {current_user.email}"
    )
    db.add(movement)
    db.commit()
    db.refresh(item)

    AuditRepository(db).record_event(
        entity_type="inventory",
        entity_id=item.id,
        action="inventory_quantity_adjusted",
        performed_by=current_user.email,
        changes={"previous_quantity": prev_qty, "new_quantity": new_quantity, "delta": update_in.delta}
    )

    return APIResponse(
        success=True,
        message=f"Stock quantity updated to {new_quantity} {item.unit}.",
        data=InventoryItemResponse.model_validate(item)
    )
