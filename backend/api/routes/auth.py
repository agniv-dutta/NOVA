import logging
from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from core.config import settings
from core.security import verify_password, create_access_token, get_password_hash
from core.database import (
    get_supabase_hostname,
    is_supabase_host_resolvable,
    supabase_admin,
)
from models.user import Token, User, UserRole
from api.deps import get_user_by_email, get_current_active_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])


class UserRegister(BaseModel):
    """User registration model."""
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = UserRole.EMPLOYEE


class MessageResponse(BaseModel):
    """Generic message response."""
    message: str


@router.post("/login", response_model=Token)
async def login(
    request: Request,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
):
    """
    OAuth2 compatible token login.
    
    Use email in the username form field (OAuth2 standard field name).

    Test credentials:
    - email: employee@company.com, password: secret (Employee)
    - email: manager@company.com, password: secret (Manager)
    - email: hr.admin@company.com, password: secret (HR)
    - email: ceo@company.com, password: secret (Leadership)
    """
    email = form_data.username.strip().lower()
    client_ip = request.client.host if request.client else "unknown"
    logger.info("🔐 Login attempt for email=%s from ip=%s", email, client_ip)
    user = get_user_by_email(email)

    if not user:
        if not is_supabase_host_resolvable():
            host = get_supabase_hostname()
            logger.error(
                "❌ Supabase DNS unresolved during login for email=%s host=%s",
                email,
                host,
            )
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=(
                    f"Authentication service unavailable: Supabase host '{host}' "
                    "is not reachable. Use demo credentials or fix SUPABASE_URL."
                ),
            )
        logger.warning("❌ Failed login attempt for email=%s from ip=%s", email, client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(form_data.password, user.hashed_password):
        logger.warning("❌ Failed login attempt for email=%s from ip=%s", email, client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    logger.info(
        "✅ Login success email=%s role=%s from ip=%s token_ttl_min=%s",
        user.email,
        user.role.value,
        client_ip,
        settings.ACCESS_TOKEN_EXPIRE_MINUTES,
    )
    return Token(access_token=access_token, token_type="bearer")


@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register(request: Request, user_data: UserRegister):
    """
    Register a new user account.
    
    Note: In production, you may want to restrict role assignment
    or require admin approval for non-employee roles.
    """
    client_ip = request.client.host if request.client else "unknown"
    logger.info(
        "📝 Registration attempt email=%s role=%s from ip=%s",
        user_data.email,
        user_data.role.value,
        client_ip,
    )
    
    # Check if email already exists
    try:
        response = supabase_admin.table("users").select("*").eq("email", user_data.email).execute()
        if response.data:
            logger.warning("❌ Registration failed - email exists: %s", user_data.email)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    except HTTPException:
        raise
    except Exception:
        logger.exception("❌ Database error during registration for email=%s", user_data.email)
        if not is_supabase_host_resolvable():
            host = get_supabase_hostname()
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Registration unavailable: Supabase host '{host}' is not reachable.",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed - database error"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = {
        "email": user_data.email.lower(),
        "full_name": user_data.full_name,
        "hashed_password": hashed_password,
        "role": user_data.role.value,
        "disabled": False
    }
    
    try:
        response = supabase_admin.table("users").insert(new_user).execute()
        created_user = response.data[0]
        logger.info(
            "✅ Registration success email=%s role=%s",
            created_user.get("email"),
            user_data.role.value,
        )
        
        return User(
            email=created_user["email"],
            full_name=created_user["full_name"],
            role=UserRole(created_user["role"]),
            disabled=created_user.get("disabled", False)
        )
    except Exception:
        logger.exception("❌ Failed to create user during registration email=%s", user_data.email)
        if not is_supabase_host_resolvable():
            host = get_supabase_hostname()
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Registration unavailable: Supabase host '{host}' is not reachable.",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed - database error"
        )


@router.post("/logout", response_model=MessageResponse)
async def logout(current_user: User = Depends(get_current_active_user)):
    """
    Logout endpoint.
    
    Note: JWT tokens are stateless, so true logout requires:
    1. Client-side: Delete the token from storage
    2. Server-side: Implement token blacklist (optional, for added security)
    
    For now, this endpoint confirms authentication and logs the action.
    Client should delete the token after receiving this response.
    """
    logger.info("👋 Logout requested by email=%s role=%s", current_user.email, current_user.role.value)
    return MessageResponse(
        message=f"Successfully logged out. Token should be deleted on client side."
    )


@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Get current user information."""
    logger.info("👤 /auth/me requested by email=%s role=%s", current_user.email, current_user.role.value)
    return current_user
