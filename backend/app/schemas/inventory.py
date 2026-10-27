from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.inventory import ItemCategoryEnum, MovementTypeEnum


class InventoryMovementCreate(BaseModel):
    quantity: int = Field(..., description="Quantity delta (positive or negative)")
    movement_type: MovementTypeEnum = MovementTypeEnum.ADJUSTMENT
    reference: Optional[str] = None
    notes: Optional[str] = None


class InventoryMovementResponse(BaseModel):
    id: str
    inventory_item_id: str
    movement_type: MovementTypeEnum
    quantity: int
    reference: Optional[str]
    performed_by_user_id: Optional[str]
    notes: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True


class InventoryItemBase(BaseModel):
    item_name: str = Field(..., min_length=2, max_length=255)
    category: ItemCategoryEnum = ItemCategoryEnum.WATER
    quantity: int = Field(default=0, ge=0)
    unit: str = Field(default="units", max_length=50)
    reorder_threshold: int = Field(default=20, ge=0)
    shelter_id: Optional[str] = None


class InventoryItemCreate(InventoryItemBase):
    pass


class InventoryItemUpdateQuantity(BaseModel):
    delta: int = Field(..., description="Quantity change (+ to add, - to deduct)")
    reason: Optional[str] = None
    reference: Optional[str] = None


class InventoryItemResponse(InventoryItemBase):
    id: str
    created_at: datetime
    updated_at: datetime
    movements: Optional[List[InventoryMovementResponse]] = []

    class Config:
        from_attributes = True
