"""0001_initial_schema

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-10-14 21:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import geoalchemy2

revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable PostGIS extension if running on PostgreSQL
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("CREATE EXTENSION IF NOT EXISTS postgis;")

    # 1. Organizations
    op.create_table(
        "organizations",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False, unique=True, index=True),
        sa.Column("org_type", sa.String(length=50), nullable=False),
        sa.Column("contact_email", sa.String(length=255), nullable=False),
        sa.Column("contact_phone", sa.String(length=50), nullable=True),
        sa.Column("address", sa.String(length=500), nullable=True),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 2. Users
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False, unique=True, index=True),
        sa.Column("hashed_password", sa.String(length=255), nullable=True),
        sa.Column("role", sa.String(length=50), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("cognito_sub", sa.String(length=100), nullable=True, unique=True, index=True),
        sa.Column("organization_id", sa.String(length=36), sa.ForeignKey("organizations.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 3. User Profiles
    op.create_table(
        "user_profiles",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id"), nullable=False, unique=True),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("phone_number", sa.String(length=50), nullable=True),
        sa.Column("responder_skills", sa.String(length=500), nullable=True),
        sa.Column("badge_number", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 4. Disaster Events
    op.create_table(
        "disaster_events",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False, index=True),
        sa.Column("disaster_type", sa.String(length=50), nullable=False, index=True),
        sa.Column("status", sa.String(length=50), nullable=False, index=True),
        sa.Column("severity", sa.String(length=50), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("declaration_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("affected_region_name", sa.String(length=255), nullable=False),
        sa.Column("affected_region_geojson", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 5. Incidents
    op.create_table(
        "incidents",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("reference_code", sa.String(length=50), nullable=False, unique=True, index=True),
        sa.Column("event_id", sa.String(length=36), sa.ForeignKey("disaster_events.id"), nullable=True, index=True),
        sa.Column("reporter_name", sa.String(length=255), nullable=False),
        sa.Column("reporter_contact", sa.String(length=100), nullable=False),
        sa.Column("reporter_is_victim", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("disaster_type", sa.String(length=50), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False, index=True),
        sa.Column("priority", sa.String(length=50), nullable=False, index=True),
        sa.Column("people_count", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("trapped_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("medical_assistance_needed", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("special_needs_description", sa.Text(), nullable=True),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("address_text", sa.String(length=500), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False, index=True),
        sa.Column("longitude", sa.Float(), nullable=False, index=True),
        sa.Column("geom", geoalchemy2.Geometry(geometry_type="POINT", srid=4326), nullable=True),
        sa.Column("ai_triage_score", sa.Float(), nullable=True),
        sa.Column("ai_suggested_priority", sa.String(length=50), nullable=True),
        sa.Column("ai_recommendation_notes", sa.Text(), nullable=True),
        sa.Column("attachment_keys", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 6. Incident Status History
    op.create_table(
        "incident_status_history",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("incident_id", sa.String(length=36), sa.ForeignKey("incidents.id"), nullable=False, index=True),
        sa.Column("previous_status", sa.String(length=50), nullable=True),
        sa.Column("new_status", sa.String(length=50), nullable=False),
        sa.Column("changed_by_user_id", sa.String(length=36), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 7. Resources
    op.create_table(
        "resources",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False, index=True),
        sa.Column("resource_type", sa.String(length=50), nullable=False, index=True),
        sa.Column("status", sa.String(length=50), nullable=False, index=True),
        sa.Column("organization_id", sa.String(length=36), sa.ForeignKey("organizations.id"), nullable=True, index=True),
        sa.Column("passenger_capacity", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("crew_count", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("battery_or_fuel_pct", sa.Integer(), nullable=False, server_default="100"),
        sa.Column("operational_notes", sa.Text(), nullable=True),
        sa.Column("contact_phone", sa.String(length=50), nullable=True),
        sa.Column("responder_lead_name", sa.String(length=255), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=False, index=True),
        sa.Column("longitude", sa.Float(), nullable=False, index=True),
        sa.Column("geom", geoalchemy2.Geometry(geometry_type="POINT", srid=4326), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 8. Resource Assignments
    op.create_table(
        "resource_assignments",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("incident_id", sa.String(length=36), sa.ForeignKey("incidents.id"), nullable=False, index=True),
        sa.Column("resource_id", sa.String(length=36), sa.ForeignKey("resources.id"), nullable=False, index=True),
        sa.Column("status", sa.String(length=50), nullable=False, index=True),
        sa.Column("assigned_by_user_id", sa.String(length=36), nullable=True),
        sa.Column("dispatcher_notes", sa.Text(), nullable=True),
        sa.Column("dispatched_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("cancelled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("cancellation_reason", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 9. Shelters
    op.create_table(
        "shelters",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False, index=True),
        sa.Column("status", sa.String(length=50), nullable=False, index=True),
        sa.Column("organization_id", sa.String(length=36), sa.ForeignKey("organizations.id"), nullable=True),
        sa.Column("address", sa.String(length=500), nullable=False),
        sa.Column("contact_phone", sa.String(length=50), nullable=True),
        sa.Column("manager_name", sa.String(length=255), nullable=True),
        sa.Column("capacity_total", sa.Integer(), nullable=False, server_default="100"),
        sa.Column("current_occupancy", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("medical_facilities_available", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("generator_backup", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("pet_friendly", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("water_purification_capacity_liters", sa.Integer(), nullable=False, server_default="1000"),
        sa.Column("latitude", sa.Float(), nullable=False, index=True),
        sa.Column("longitude", sa.Float(), nullable=False, index=True),
        sa.Column("geom", geoalchemy2.Geometry(geometry_type="POINT", srid=4326), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 10. Shelter Capacity Records
    op.create_table(
        "shelter_capacity_records",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("shelter_id", sa.String(length=36), sa.ForeignKey("shelters.id"), nullable=False, index=True),
        sa.Column("occupancy_count", sa.Integer(), nullable=False),
        sa.Column("available_beds", sa.Integer(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("recorded_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 11. Inventory Items
    op.create_table(
        "inventory_items",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("shelter_id", sa.String(length=36), sa.ForeignKey("shelters.id"), nullable=True, index=True),
        sa.Column("item_name", sa.String(length=255), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False, index=True),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("unit", sa.String(length=50), nullable=False, server_default="units"),
        sa.Column("reorder_threshold", sa.Integer(), nullable=False, server_default="20"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 12. Inventory Movements
    op.create_table(
        "inventory_movements",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("inventory_item_id", sa.String(length=36), sa.ForeignKey("inventory_items.id"), nullable=False, index=True),
        sa.Column("movement_type", sa.String(length=50), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("reference", sa.String(length=255), nullable=True),
        sa.Column("performed_by_user_id", sa.String(length=36), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
    )

    # 13. Audit Events
    op.create_table(
        "audit_events",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("entity_type", sa.String(length=100), nullable=False, index=True),
        sa.Column("entity_id", sa.String(length=36), nullable=False, index=True),
        sa.Column("action", sa.String(length=100), nullable=False),
        sa.Column("performed_by", sa.String(length=255), nullable=False),
        sa.Column("changes_json", sa.Text(), nullable=True),
        sa.Column("ip_address", sa.String(length=50), nullable=True),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False, index=True),
    )


def downgrade() -> None:
    op.drop_table("audit_events")
    op.drop_table("inventory_movements")
    op.drop_table("inventory_items")
    op.drop_table("shelter_capacity_records")
    op.drop_table("shelters")
    op.drop_table("resource_assignments")
    op.drop_table("resources")
    op.drop_table("incident_status_history")
    op.drop_table("incidents")
    op.drop_table("disaster_events")
    op.drop_table("user_profiles")
    op.drop_table("users")
    op.drop_table("organizations")
