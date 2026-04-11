from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from api.deps import require_role
from core.database import get_supabase_admin
from models.user import User, UserRole

router = APIRouter(prefix="/api/recognition", tags=["Recognition"])


class RecognitionRequest(BaseModel):
    employee_id: str
    given_by: str
    recognition_type: Literal[
        "above_and_beyond",
        "team_player",
        "innovation",
        "milestone",
        "customer_impact",
    ]
    message: str = Field(..., min_length=5, max_length=1000)
    is_public: bool = True


@router.post("/send")
async def send_recognition(
    payload: RecognitionRequest,
    current_user: User = Depends(require_role([UserRole.MANAGER, UserRole.HR, UserRole.LEADERSHIP])),
) -> dict[str, Any]:
    supabase = get_supabase_admin()
    row = {
        "employee_id": payload.employee_id,
        "given_by": payload.given_by or current_user.email,
        "recognition_type": payload.recognition_type,
        "message": payload.message,
        "is_public": payload.is_public,
        "created_at": datetime.utcnow().isoformat(),
    }
    try:
        result = supabase.table("recognitions").insert(row).execute()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to send recognition: {exc}") from exc

    return {"status": "sent", "recognition": (result.data or [row])[0]}


@router.get("/{employee_id}")
async def get_recognition_history(
    employee_id: str,
    current_user: User = Depends(require_role([UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR, UserRole.LEADERSHIP])),
) -> dict[str, Any]:
    if current_user.role == UserRole.EMPLOYEE and current_user.email != employee_id:
        raise HTTPException(status_code=403, detail="Employees can only view their own recognitions")

    supabase = get_supabase_admin()
    response = (
        supabase.table("recognitions")
        .select("id, employee_id, given_by, recognition_type, message, is_public, created_at")
        .eq("employee_id", employee_id)
        .order("created_at", desc=True)
        .execute()
    )
    rows = response.data or []
    cutoff = datetime.now(timezone.utc) - timedelta(days=90)

    def _is_recent(value: Any) -> bool:
        if not value:
            return False
        try:
            created = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
            return created >= cutoff
        except ValueError:
            return False

    return {
        "employee_id": employee_id,
        "recognitions": rows,
        "recognition_count_90d": sum(1 for row in rows if _is_recent(row.get("created_at"))),
    }
