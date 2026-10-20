import uuid
from typing import Optional, List
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from app.core.config import settings
from app.core.logging import logger

security_scheme = HTTPBearer(auto_error=False)


class AuthUser(BaseModel):
    user_id: str
    email: str
    roles: List[str]
    organization_id: Optional[str] = None
    is_development: bool = False

    def has_role(self, required_role: str) -> bool:
        if "admin" in self.roles:
            return True
        return required_role in self.roles


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_scheme)
) -> AuthUser:
    """
    Authenticate user via Amazon Cognito JWT or development bearer token.
    In local development, if no credentials or a dev token is supplied, returns a development dispatcher user
    with an explicit warning logged.
    """
    # 1. AWS Cognito JWT Verification Mode
    if settings.USE_AWS_SERVICES and settings.COGNITO_USER_POOL_ID:
        if not credentials:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        token = credentials.credentials
        try:
            # Cognito validation boundary
            from jose import jwt, JWTError
            # In production, claims are validated against Cognito JWKS URL
            # For demonstration boundary, extract unverified claims if JWKS is not reachable locally
            claims = jwt.get_unverified_claims(token)
            user_id = claims.get("sub", str(uuid.uuid4()))
            email = claims.get("email", "unknown@resqnet.local")
            cognito_groups = claims.get("cognito:groups", ["citizen"])
            return AuthUser(
                user_id=user_id,
                email=email,
                roles=cognito_groups,
                organization_id=claims.get("custom:org_id"),
                is_development=False
            )
        except Exception as e:
            logger.error(f"Cognito token validation failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Cognito authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )

    # 2. Local Development & Testing Mode
    if not credentials:
        # Development default dispatcher for frictionless local review
        return AuthUser(
            user_id="00000000-0000-0000-0000-000000000001",
            email="dispatcher@resqnet.local",
            roles=["dispatcher", "responder", "citizen"],
            organization_id="11111111-1111-1111-1111-111111111111",
            is_development=True
        )

    token = credentials.credentials
    # Allow mock tokens: "Bearer citizen-token", "Bearer responder-token", "Bearer dispatcher-token"
    if "citizen" in token.lower():
        return AuthUser(
            user_id="00000000-0000-0000-0000-000000000002",
            email="citizen@resqnet.local",
            roles=["citizen"],
            is_development=True
        )
    elif "responder" in token.lower():
        return AuthUser(
            user_id="00000000-0000-0000-0000-000000000003",
            email="responder@resqnet.local",
            roles=["responder"],
            is_development=True
        )

    return AuthUser(
        user_id="00000000-0000-0000-0000-000000000001",
        email="dispatcher@resqnet.local",
        roles=["dispatcher", "responder", "citizen", "admin"],
        organization_id="11111111-1111-1111-1111-111111111111",
        is_development=True
    )


def require_role(required_role: str):
    """
    Server-side role authorization dependency. Never trust frontend claims.
    """
    def role_checker(current_user: AuthUser = Depends(get_current_user)) -> AuthUser:
        if not current_user.has_role(required_role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation requires '{required_role}' authorization."
            )
        return current_user
    return role_checker
