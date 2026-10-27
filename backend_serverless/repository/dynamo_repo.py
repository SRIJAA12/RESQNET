"""
DynamoDB Single-Table Repository for RESQNET Incidents.
Handles persistence, conditional idempotency checks, and GSI2 queries.
"""
import os
import logging
from abc import ABC, abstractmethod
from decimal import Decimal
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
import boto3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)


class IncidentRepositoryError(Exception):
    """Base exception for repository operations."""
    pass


class DuplicateIncidentError(IncidentRepositoryError):
    """Raised when an incident identifier or reference already exists."""
    pass


class StorageError(IncidentRepositoryError):
    """Raised when an underlying database failure occurs."""
    pass


class IncidentRepository(ABC):
    """Abstract interface for Incident storage."""

    @abstractmethod
    def put_incident(self, item: Dict[str, Any]) -> None:
        """Persist incident with collision prevention."""
        pass

    @abstractmethod
    def get_by_reference(self, reference_code: str) -> Optional[Dict[str, Any]]:
        """Retrieve an incident item by public reference code using GSI2."""
        pass

    @abstractmethod
    def get_by_id(self, incident_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve an incident item by its primary key."""
        pass

    @abstractmethod
    def list_by_status(self, status: str, limit: int = 50) -> List[Dict[str, Any]]:
        """List incidents with matching status via GSI1."""
        pass

    @abstractmethod
    def update_status(
        self, incident_id: str, new_status: str, notes: Optional[str] = None, timestamp: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Update incident status and append to status history."""
        pass

    @abstractmethod
    def update_status_by_reference(
        self, reference_code: str, new_status: str, notes: Optional[str] = None, timestamp: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Update incident status by public reference code and append to status history."""
        pass


class DynamoDBIncidentRepository(IncidentRepository):
    """
    AWS DynamoDB single-table implementation.
    Reads TABLE_NAME and optional DYNAMODB_ENDPOINT_URL from environment.
    """

    def __init__(self, table_name: Optional[str] = None, endpoint_url: Optional[str] = None):
        self.table_name = table_name or os.environ.get("TABLE_NAME", "resqnet-core-table")
        self.endpoint_url = endpoint_url or os.environ.get("DYNAMODB_ENDPOINT_URL")

        client_kwargs = {}
        if self.endpoint_url:
            client_kwargs["endpoint_url"] = self.endpoint_url

        # In local/testing mode without real AWS credentials, provide dummy credentials if unset
        if "AWS_DEFAULT_REGION" not in os.environ and "AWS_REGION" not in os.environ:
            os.environ["AWS_DEFAULT_REGION"] = "us-east-1"

        self.dynamodb = boto3.resource("dynamodb", **client_kwargs)
        self.table = self.dynamodb.Table(self.table_name)

    def put_incident(self, item: Dict[str, Any]) -> None:
        try:
            # Conditional write: Ensure item with same PK does not already exist
            self.table.put_item(
                Item=item,
                ConditionExpression="attribute_not_exists(PK)"
            )
        except ClientError as e:
            code = e.response.get("Error", {}).get("Code")
            if code == "ConditionalCheckFailedException":
                raise DuplicateIncidentError(f"Incident with PK '{item.get('PK')}' already exists") from e
            logger.error("DynamoDB put_item failed: %s", code)
            raise StorageError(f"Storage failure persisting incident: {code}") from e
        except Exception as e:
            logger.error("Unexpected error persisting incident: %s", str(e))
            raise StorageError("Unexpected storage failure") from e

    def get_by_reference(self, reference_code: str) -> Optional[Dict[str, Any]]:
        gsi2_pk = f"REF#{reference_code.strip().upper()}"
        try:
            # Targeted Query against GSI2 - NOT a full table scan
            response = self.table.query(
                IndexName="GSI2",
                KeyConditionExpression=Key("GSI2_PK").eq(gsi2_pk) & Key("GSI2_SK").eq("METADATA"),
                Limit=1
            )
            items = response.get("Items", [])
            if not items:
                return None
            return items[0]
        except ClientError as e:
            code = e.response.get("Error", {}).get("Code")
            logger.error("DynamoDB query failed for reference '%s': %s", reference_code, code)
            raise StorageError(f"Storage failure querying reference: {code}") from e
        except Exception as e:
            logger.error("Unexpected error querying reference '%s': %s", reference_code, str(e))
            raise StorageError("Unexpected storage query failure") from e

    def get_by_id(self, incident_id: str) -> Optional[Dict[str, Any]]:
        pk = f"INC#{incident_id}" if not incident_id.startswith("INC#") else incident_id
        try:
            response = self.table.get_item(
                Key={"PK": pk, "SK": "METADATA"}
            )
            return response.get("Item")
        except ClientError as e:
            code = e.response.get("Error", {}).get("Code")
            logger.error("DynamoDB get_item failed for id '%s': %s", incident_id, code)
            raise StorageError(f"Storage failure fetching incident: {code}") from e
    def list_by_status(self, status: str, limit: int = 50) -> List[Dict[str, Any]]:
        clean_status = status.strip().lower()
        gsi1_pk = f"STATUS#{clean_status}"
        try:
            response = self.table.query(
                IndexName="GSI1",
                KeyConditionExpression=Key("GSI1_PK").eq(gsi1_pk),
                Limit=limit
            )
            return response.get("Items", [])
        except ClientError as e:
            code = e.response.get("Error", {}).get("Code")
            logger.error("DynamoDB GSI1 query failed for status '%s': %s", clean_status, code)
            raise StorageError(f"Storage failure querying by status: {code}") from e
        except Exception as e:
            logger.error("Unexpected error querying status '%s': %s", clean_status, str(e))
            raise StorageError("Unexpected storage query failure") from e

    def update_status(
        self, incident_id: str, new_status: str, notes: Optional[str] = None, timestamp: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        pk = f"INC#{incident_id}" if not incident_id.startswith("INC#") else incident_id
        now_iso = timestamp or datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        new_status_clean = new_status.strip().lower()

        existing = self.get_by_id(incident_id)
        if not existing:
            return None

        history = list(existing.get("status_history", []))
        milestone = {
            "status": new_status_clean,
            "timestamp": now_iso,
            "notes": notes or f"Status updated to {new_status_clean}",
        }
        history.append(milestone)

        try:
            response = self.table.update_item(
                Key={"PK": pk, "SK": "METADATA"},
                UpdateExpression="SET #st = :st, updated_at = :upd, GSI1_PK = :g1pk, GSI1_SK = :g1sk, status_history = :hist",
                ExpressionAttributeNames={"#st": "status"},
                ExpressionAttributeValues={
                    ":st": new_status_clean,
                    ":upd": now_iso,
                    ":g1pk": f"STATUS#{new_status_clean}",
                    ":g1sk": now_iso,
                    ":hist": history,
                },
                ReturnValues="ALL_NEW",
            )
            return response.get("Attributes")
        except ClientError as e:
            code = e.response.get("Error", {}).get("Code")
            logger.error("DynamoDB update_item failed for id '%s': %s", incident_id, code)
            raise StorageError(f"Storage failure updating incident status: {code}") from e
        except Exception as e:
            logger.error("Unexpected error updating incident status '%s': %s", incident_id, str(e))
            raise StorageError("Unexpected storage update failure") from e

    def update_status_by_reference(
        self, reference_code: str, new_status: str, notes: Optional[str] = None, timestamp: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        item = self.get_by_reference(reference_code)
        if not item:
            return None
        inc_id = item.get("incident_id")
        if not inc_id:
            return None
        return self.update_status(inc_id, new_status, notes, timestamp)


class InMemoryIncidentRepository(IncidentRepository):
    """
    In-memory incident repository test double.
    Enforces exact conditional write uniqueness and GSI2 query simulation without requiring AWS credentials or network.
    """

    def __init__(self, simulate_storage_failure: bool = False):
        self._items: Dict[str, Dict[str, Any]] = {}  # Key: PK
        self.simulate_storage_failure = simulate_storage_failure
        self._gsi_lag: Dict[str, int] = {}

    def simulate_gsi_lag(self, reference_code: str, lag_queries: int = 1) -> None:
        """Configures simulated GSI eventual consistency lag for a reference code."""
        self._gsi_lag[reference_code.strip().upper()] = lag_queries

    def put_incident(self, item: Dict[str, Any]) -> None:
        if self.simulate_storage_failure:
            raise StorageError("Simulated storage backend failure")

        pk = item.get("PK")
        if not pk:
            raise ValueError("Item missing required PK")

        # Conditional write check: attribute_not_exists(PK)
        if pk in self._items:
            raise DuplicateIncidentError(f"Incident with PK '{pk}' already exists")

        # Also enforce reference code uniqueness simulation
        ref = item.get("reference_code")
        if ref:
            for existing in self._items.values():
                if existing.get("reference_code") == ref:
                    raise DuplicateIncidentError(f"Incident with reference '{ref}' already exists")

        self._items[pk] = dict(item)

    def get_by_reference(self, reference_code: str) -> Optional[Dict[str, Any]]:
        if self.simulate_storage_failure:
            raise StorageError("Simulated storage backend failure")

        norm_ref = reference_code.strip().upper()

        # Simulate GSI eventual consistency lag if configured
        if self._gsi_lag.get(norm_ref, 0) > 0:
            self._gsi_lag[norm_ref] -= 1
            return None

        gsi2_pk = f"REF#{norm_ref}"
        for item in self._items.values():
            if item.get("GSI2_PK") == gsi2_pk and item.get("GSI2_SK") == "METADATA":
                return dict(item)
            # Fallback direct match on reference_code field
            if item.get("reference_code", "").upper() == norm_ref:
                return dict(item)
        return None

    def get_by_id(self, incident_id: str) -> Optional[Dict[str, Any]]:
        if self.simulate_storage_failure:
            raise StorageError("Simulated storage backend failure")

        pk = f"INC#{incident_id}" if not incident_id.startswith("INC#") else incident_id
        item = self._items.get(pk)
        return dict(item) if item else None

    def list_by_status(self, status: str, limit: int = 50) -> List[Dict[str, Any]]:
        if self.simulate_storage_failure:
            raise StorageError("Simulated storage backend failure")
        clean_status = status.strip().lower()
        gsi1_pk = f"STATUS#{clean_status}"
        matches = [
            dict(item) for item in self._items.values()
            if item.get("GSI1_PK") == gsi1_pk or item.get("status", "").lower() == clean_status
        ]
        return matches[:limit]

    def update_status(
        self, incident_id: str, new_status: str, notes: Optional[str] = None, timestamp: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        if self.simulate_storage_failure:
            raise StorageError("Simulated storage backend failure")
        pk = f"INC#{incident_id}" if not incident_id.startswith("INC#") else incident_id
        item = self._items.get(pk)
        if not item:
            return None

        now_iso = timestamp or datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        new_status_clean = new_status.strip().lower()

        history = list(item.get("status_history", []))
        milestone = {
            "status": new_status_clean,
            "timestamp": now_iso,
            "notes": notes or f"Status updated to {new_status_clean}",
        }
        history.append(milestone)

        item["status"] = new_status_clean
        item["updated_at"] = now_iso
        item["GSI1_PK"] = f"STATUS#{new_status_clean}"
        item["GSI1_SK"] = now_iso
        item["status_history"] = history
        return dict(item)

    def update_status_by_reference(
        self, reference_code: str, new_status: str, notes: Optional[str] = None, timestamp: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        item = self.get_by_reference(reference_code)
        if not item:
            return None
        inc_id = item.get("incident_id")
        if not inc_id:
            return None
        return self.update_status(inc_id, new_status, notes, timestamp)



_repo_instance: Optional[IncidentRepository] = None


def get_incident_repository() -> IncidentRepository:
    """Singleton/Factory accessor for the active repository."""
    global _repo_instance
    if _repo_instance is None:
        _repo_instance = DynamoDBIncidentRepository()
    return _repo_instance


def set_incident_repository(repo: IncidentRepository) -> None:
    """Allows test fixtures to inject an in-memory repository or mock client."""
    global _repo_instance
    _repo_instance = repo
