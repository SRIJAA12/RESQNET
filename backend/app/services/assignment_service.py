from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.assignment import ResourceAssignment, AssignmentStatusEnum
from app.models.incident import Incident, IncidentStatusEnum
from app.models.resource import Resource, ResourceStatusEnum
from app.schemas.assignment import AssignmentCreate, AssignmentUpdate
from app.repositories.assignment_repo import AssignmentRepository
from app.repositories.incident_repo import IncidentRepository
from app.repositories.audit_repo import AuditRepository
from app.core.aws import sns_service


class AssignmentConflictError(Exception):
    pass


class AssignmentService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = AssignmentRepository(db)
        self.incident_repo = IncidentRepository(db)
        self.audit_repo = AuditRepository(db)

    def create_assignment(
        self,
        data: AssignmentCreate,
        dispatcher_user_id: str,
        dispatcher_email: str = "dispatcher"
    ) -> ResourceAssignment:
        """
        Transaction-safe assignment workflow:
        1. Locks target resource row with FOR UPDATE.
        2. Verifies resource is AVAILABLE and has no conflicting active assignments.
        3. Updates incident to ASSIGNED/IN_PROGRESS.
        4. Transitions resource to DEPLOYED.
        5. Triggers dispatch notification and records audit event.
        """
        # Begin transaction safety check with row-level locking
        try:
            # Row-level lock on the resource to prevent concurrent race conditions
            resource = (
                self.db.query(Resource)
                .filter(Resource.id == data.resource_id)
                .with_for_update()
                .first()
            )

            if not resource:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Resource '{data.resource_id}' not found."
                )

            # Check if resource is available
            if resource.status in [ResourceStatusEnum.DECOMMISSIONED, ResourceStatusEnum.MAINTENANCE]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Resource '{resource.name}' is currently {resource.status.value}."
                )

            # Check if resource already has an active assignment
            active_assignment = self.repo.get_active_assignment_for_resource(resource.id)
            if active_assignment:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        f"Resource '{resource.name}' is already assigned to active assignment "
                        f"#{active_assignment.id} (Status: {active_assignment.status.value}). "
                        f"Complete or cancel the existing assignment before reassigning."
                    )
                )

            # Check incident
            incident = (
                self.db.query(Incident)
                .filter(Incident.id == data.incident_id)
                .with_for_update()
                .first()
            )

            if not incident:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Incident '{data.incident_id}' not found."
                )

            if incident.status in [IncidentStatusEnum.RESOLVED, IncidentStatusEnum.REJECTED]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot assign resources to an incident that is already {incident.status.value}."
                )

            # Determine initial assignment status
            initial_status = AssignmentStatusEnum.DISPATCHED if data.auto_dispatch else AssignmentStatusEnum.APPROVED
            now_dt = datetime.now(timezone.utc)

            assignment = ResourceAssignment(
                incident_id=incident.id,
                resource_id=resource.id,
                status=initial_status,
                assigned_by_user_id=dispatcher_user_id,
                dispatcher_notes=data.dispatcher_notes,
                dispatched_at=now_dt if data.auto_dispatch else None,
            )
            self.db.add(assignment)

            # Update Resource status to DEPLOYED
            resource.status = ResourceStatusEnum.DEPLOYED

            # Update Incident status to ASSIGNED or IN_PROGRESS
            prev_incident_status = incident.status.value
            new_incident_status = IncidentStatusEnum.IN_PROGRESS if data.auto_dispatch else IncidentStatusEnum.ASSIGNED
            incident.status = new_incident_status

            self.db.commit()
            self.db.refresh(assignment)

            # Add incident status history entry
            self.incident_repo.add_status_history(
                incident_id=incident.id,
                previous_status=prev_incident_status,
                new_status=new_incident_status.value,
                changed_by_user_id=dispatcher_user_id,
                notes=f"Resource '{resource.name}' assigned by dispatcher ({dispatcher_email})"
            )

            # Audit event
            self.audit_repo.record_event(
                entity_type="assignment",
                entity_id=assignment.id,
                action="resource_assigned",
                performed_by=dispatcher_email,
                changes={
                    "incident_id": incident.id,
                    "incident_ref": incident.reference_code,
                    "resource_name": resource.name,
                    "status": assignment.status.value
                }
            )

            # Trigger AWS SNS dispatch notification
            sns_service.publish_dispatch_alert(
                incident_ref=incident.reference_code,
                resource_name=resource.name,
                notes=data.dispatcher_notes or "Dispatched by authorized human control room"
            )

            return assignment

        except HTTPException:
            self.db.rollback()
            raise
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create resource assignment: {str(e)}"
            )

    def list_by_incident(self, incident_id: str) -> List[ResourceAssignment]:
        return self.repo.list_by_incident(incident_id)
