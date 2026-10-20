import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Integer, ForeignKey, DateTime, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.base import UUIDPrimaryKeyMixin, TimestampMixin


class ItemCategoryEnum(str, enum.Enum):
    WATER = "water"
    DRY_RATION = "dry_ration"
    MEDICAL_KIT = "medical_kit"
    BLANKETS = "blankets"
    LIFE_VESTS = "life_vests"
    HYGIENE_PACK = "hygiene_pack"


class MovementTypeEnum(str, enum.Enum):
    INBOUND = "inbound"
    OUTBOUND = "outbound"
    TRANSFERRED = "transferred"
    ADJUSTMENT = "adjustment"


class InventoryItem(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "inventory_items"

    shelter_id = Column(String(36), ForeignKey("shelters.id"), nullable=True, index=True)
    item_name = Column(String(255), nullable=False)
    category = Column(SAEnum(ItemCategoryEnum), default=ItemCategoryEnum.WATER, nullable=False, index=True)
    quantity = Column(Integer, default=0, nullable=False)
    unit = Column(String(50), default="units", nullable=False)  # liters, packets, boxes, units
    reorder_threshold = Column(Integer, default=20, nullable=False)

    shelter = relationship("Shelter", back_populates="inventory_items")
    movements = relationship("InventoryMovement", back_populates="item", cascade="all, delete-orphan")


class InventoryMovement(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "inventory_movements"

    inventory_item_id = Column(String(36), ForeignKey("inventory_items.id"), nullable=False, index=True)
    movement_type = Column(SAEnum(MovementTypeEnum), nullable=False)
    quantity = Column(Integer, nullable=False)
    reference = Column(String(255), nullable=True)  # Incident reference or delivery invoice
    performed_by_user_id = Column(String(36), nullable=True)
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    item = relationship("InventoryItem", back_populates="movements")
