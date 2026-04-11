from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from api.deps import require_role
from core.database import get_supabase_admin
from models.user import User, UserRole

router = APIRouter(prefix="/api/messages", tags=["Messages"])


class SendMessageRequest(BaseModel):
    to_employee_id: str
    from_user_id: str
    subject: str = Field(..., min_length=3, max_length=180)
    body: str = Field(..., min_length=10, max_length=5000)
    message_type: Literal["general", "recognition", "alert", "action_required"] = "general"


@router.post("/send")
async def send_message(
    payload: SendMessageRequest,
    current_user: User = Depends(require_role([UserRole.MANAGER, UserRole.HR, UserRole.LEADERSHIP])),
) -> dict[str, Any]:
    supabase = get_supabase_admin()
    row = {
        "to_employee_id": payload.to_employee_id,
        "from_user_id": payload.from_user_id or current_user.email,
        "subject": payload.subject,
        "body": payload.body,
        "message_type": payload.message_type,
        "is_read": False,
        "created_at": datetime.utcnow().isoformat(),
    }
    try:
        result = supabase.table("internal_messages").insert(row).execute()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to send message: {exc}") from exc
    return {"status": "sent", "message": (result.data or [row])[0]}


@router.get("/inbox")
async def get_inbox(
    current_user: User = Depends(require_role([UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR, UserRole.LEADERSHIP])),
) -> dict[str, Any]:
    supabase = get_supabase_admin()
    response = (
        supabase.table("internal_messages")
        .select("id, to_employee_id, from_user_id, subject, body, message_type, is_read, created_at")
        .eq("to_employee_id", current_user.email)
        .order("created_at", desc=True)
        .execute()
    )
    rows = response.data or []
    unread_count = sum(1 for row in rows if not bool(row.get("is_read")))
    return {"messages": rows, "unread_count": unread_count}


@router.patch("/{message_id}/read")
async def mark_message_read(
    message_id: str,
    current_user: User = Depends(require_role([UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR, UserRole.LEADERSHIP])),
) -> dict[str, Any]:
    supabase = get_supabase_admin()
    found = (
        supabase.table("internal_messages")
        .select("id, to_employee_id, is_read")
        .eq("id", message_id)
        .limit(1)
        .execute()
    )
    rows = found.data or []
    if not rows:
        raise HTTPException(status_code=404, detail="Message not found")
    row = rows[0]
    if row.get("to_employee_id") != current_user.email and current_user.role not in (UserRole.HR, UserRole.LEADERSHIP):
        raise HTTPException(status_code=403, detail="Not allowed to modify this message")

    updated = (
        supabase.table("internal_messages")
        .update({"is_read": True})
        .eq("id", message_id)
        .execute()
    )
    return {"status": "read", "message": (updated.data or [])[0] if updated.data else {"id": message_id, "is_read": True}}
