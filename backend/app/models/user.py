import enum
from sqlalchemy import Column, String, Boolean, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.base import UUIDPrimaryKeyMixin, TimestampMixin


class UserRoleEnum(str, enum.Enum):
    CITIZEN = "citizen"
    RESPONDER = "responder"
    DISPATCHER = "dispatcher"
    ADMIN = "admin"


class OrgTypeEnum(str, enum.Enum):
    GOVERNMENT = "government"
    NGO = "ngo"
    HOSPITAL = "hospital"
    SHELTER_OPERATOR = "shelter_operator"
    COMMUNITY = "community"


class Organization(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "organizations"

    name = Column(String(255), nullable=False, unique=True, index=True)
    org_type = Column(SAEnum(OrgTypeEnum), default=OrgTypeEnum.NGO, nullable=False)
    contact_email = Column(String(255), nullable=False)
    contact_phone = Column(String(50), nullable=True)
    address = Column(String(500), nullable=True)
    is_verified = Column(Boolean, default=True, nullable=False)

    users = relationship("User", back_populates="organization")
    resources = relationship("Resource", back_populates="organization")
    shelters = relationship("Shelter", back_populates="organization")


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "users"

    email = Column(String(255), unique=True, index=True, nullable=False)
    # Password hash is handled via Cognito in prod; local hash fallback only
    hashed_password = Column(String(255), nullable=True)
    role = Column(SAEnum(UserRoleEnum), default=UserRoleEnum.CITIZEN, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    cognito_sub = Column(String(100), unique=True, index=True, nullable=True)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=True)

    organization = relationship("Organization", back_populates="users")
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")


class UserProfile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "user_profiles"

    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, unique=True)
    full_name = Column(String(255), nullable=False)
    phone_number = Column(String(50), nullable=True)
    responder_skills = Column(String(500), nullable=True)  # e.g., "swiftwater_rescue,paramedic"
    badge_number = Column(String(100), nullable=True)

    user = relationship("User", back_populates="profile")
