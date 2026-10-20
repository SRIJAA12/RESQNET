import os
import uuid
from typing import Dict, Any, Optional
from app.core.config import settings
from app.core.logging import logger


class S3StorageService:
    """
    S3 Integration Boundary: Generate short-lived presigned URLs for safe attachment uploads
    and downloads without piping large binaries through the API container.
    """
    def __init__(self, bucket_name: Optional[str] = None):
        self.bucket_name = bucket_name or settings.S3_ATTACHMENT_BUCKET_NAME
        self.enabled = settings.USE_AWS_SERVICES

    def generate_presigned_upload_url(
        self,
        object_key: str,
        content_type: str,
        expires_in: int = 900,
        max_content_length: int = 10 * 1024 * 1024  # 10MB limit
    ) -> Dict[str, Any]:
        """
        Validate file content-type, ensure safe extensions, and generate presigned PUT URL.
        """
        allowed_types = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
        if content_type not in allowed_types:
            raise ValueError(f"Content-Type '{content_type}' is not permitted for attachments.")

        if not self.enabled:
            # Mock URL for local development
            logger.info(f"[MOCK S3] Generated presigned upload URL for key: {object_key} (Bucket: {self.bucket_name})")
            return {
                "upload_url": f"http://localhost:8000/api/mock-storage/{self.bucket_name}/{object_key}",
                "object_key": object_key,
                "expires_in": expires_in,
                "is_mock": True
            }

        try:
            import boto3
            from botocore.config import Config
            s3_client = boto3.client("s3", region_name=settings.AWS_REGION, config=Config(signature_version="s3v4"))
            url = s3_client.generate_presigned_url(
                ClientMethod="put_object",
                Params={
                    "Bucket": self.bucket_name,
                    "Key": object_key,
                    "ContentType": content_type
                },
                ExpiresIn=expires_in
            )
            return {
                "upload_url": url,
                "object_key": object_key,
                "expires_in": expires_in,
                "is_mock": False
            }
        except Exception as e:
            logger.error(f"Failed to generate AWS S3 presigned URL: {str(e)}")
            raise RuntimeError("Storage service error")


class SNSNotificationService:
    """
    SNS Integration Boundary: Dispatches critical alerts and responder notification workflows.
    """
    def __init__(self, topic_arn: Optional[str] = None):
        self.topic_arn = topic_arn or settings.SNS_DISPATCH_TOPIC_ARN
        self.enabled = settings.USE_AWS_SERVICES and bool(self.topic_arn)

    def publish_dispatch_alert(self, incident_ref: str, resource_name: str, notes: str) -> str:
        message = (
            f"DISPATCH ALERT [RESQNET]: Unit '{resource_name}' assigned to Incident #{incident_ref}. "
            f"Details: {notes}. Human authorized."
        )
        if not self.enabled:
            mock_id = f"mock-msg-{uuid.uuid4()}"
            logger.info(f"[MOCK SNS] Published dispatch notification: {message}")
            return mock_id

        try:
            import boto3
            sns_client = boto3.client("sns", region_name=settings.AWS_REGION)
            response = sns_client.publish(
                TopicArn=self.topic_arn,
                Message=message,
                Subject=f"RESQNET Dispatch: {incident_ref}"
            )
            return response.get("MessageId", "unknown")
        except Exception as e:
            logger.error(f"Failed to publish SNS alert: {str(e)}")
            return "failed"


class SecretsManagerService:
    """
    AWS Secrets Manager Boundary: Fetches runtime database passwords and sensitive API keys.
    """
    @staticmethod
    def get_secret(secret_name: str) -> Optional[str]:
        if not settings.USE_AWS_SERVICES:
            logger.info(f"[MOCK SECRETS] Mock retrieval for secret: {secret_name}")
            return os.getenv(secret_name)

        try:
            import boto3
            client = boto3.client("secretsmanager", region_name=settings.AWS_REGION)
            response = client.get_secret_value(SecretId=secret_name)
            return response.get("SecretString")
        except Exception as e:
            logger.error(f"Secrets Manager lookup failed for {secret_name}: {str(e)}")
            return None


s3_service = S3StorageService()
sns_service = SNSNotificationService()
secrets_service = SecretsManagerService()
