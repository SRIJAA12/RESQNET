import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    APP_NAME: str = "RESQNET — Intelligent Disaster Relief Ecosystem"
    PROJECT_VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "dev-secret-key-change-in-production-must-be-32-chars-long"

    HOST: str = "0.0.0.0"
    PORT: int = 8000
    API_V1_PREFIX: str = "/api/v1"

    # CORS
    ALLOWED_ORIGINS: Union[str, List[str]] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    # Database
    DATABASE_URL: str = "postgresql://resqnet_user:resqnet_password@postgres:5432/resqnet_db"

    # AWS boundaries
    USE_AWS_SERVICES: bool = False
    AWS_REGION: str = "us-east-1"
    COGNITO_USER_POOL_ID: str = ""
    COGNITO_APP_CLIENT_ID: str = ""
    COGNITO_JWKS_URL: str = ""
    S3_ATTACHMENT_BUCKET_NAME: str = "resqnet-incident-attachments-dev"
    S3_PRESIGNED_EXPIRY_SECONDS: int = 900
    SNS_DISPATCH_TOPIC_ARN: str = ""
    CLOUDWATCH_LOG_GROUP: str = "/resqnet/backend-dev"


settings = Settings()
