"""
Authentication and authorization for RESQNET FastAPI backend.

Uses simple bearer token role simulation for local development and demo.
Replace with a real JWT library (python-jose, authlib) tied to your identity
provider (Auth0, Cognito, Keycloak, etc.) for production deployments.
"""
import uuid
from typing import Optional, List
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
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
    Resolves the current user from an HTTP Bearer token.

    In local development / demo mode:
      - No credentials → default dispatcher user (full access).
      - Token containing 'citizen' → citizen-only user.
      - Token containing 'responder' → responder user.
      - Anything else → full dispatcher/admin user.

    Replace this function with real JWT validation for production.
    """
    if not credentials:
        # Development default: frictionless dispatcher access for local review
        logger.debug("No auth credentials supplied — using development dispatcher identity")
        return AuthUser(
            user_id="00000000-0000-0000-0000-000000000001",
            email="dispatcher@resqnet.local",
            roles=["dispatcher", "responder", "citizen"],
            organization_id="11111111-1111-1111-1111-111111111111",
            is_development=True
        )

    token = credentials.credentials

    # Allow mock role tokens for demo / frontend testing
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

    # Default: treat any unknown token as full dispatcher access in dev
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
