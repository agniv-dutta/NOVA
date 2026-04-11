from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from api.deps import require_role
from core.database import get_supabase_admin
from models.user import User, UserRole

router = APIRouter(prefix="/api/meetings", tags=["Meetings"])


class ScheduleMeetingRequest(BaseModel):
    employee_id: str
    manager_id: str
    suggested_date: datetime
    meeting_type: Literal["1on1"] = "1on1"
    notes: str = Field(default="", max_length=2000)
    urgency: Literal["normal", "urgent"] = "normal"
    force_reschedule: bool = False


@router.post("/schedule")
async def schedule_meeting(
    payload: ScheduleMeetingRequest,
    current_user: User = Depends(require_role([UserRole.MANAGER, UserRole.HR, UserRole.LEADERSHIP])),
) -> dict[str, Any]:
    supabase = get_supabase_admin()
    seven_days_later = datetime.utcnow() + timedelta(days=7)

    existing = (
        supabase.table("scheduled_meetings")
        .select("id, scheduled_date, status")
        .eq("employee_id", payload.employee_id)
        .in_("status", ["pending", "confirmed"])
        .gte("scheduled_date", datetime.utcnow().isoformat())
        .lte("scheduled_date", seven_days_later.isoformat())
        .order("scheduled_date", desc=False)
        .limit(1)
        .execute()
    )

    active = (existing.data or [])
    if active and not payload.force_reschedule:
        return {
            "already_scheduled": True,
            "meeting": active[0],
            "message": f"1:1 already scheduled for {active[0].get('scheduled_date')}",
        }

    if active and payload.force_reschedule:
        updated = (
            supabase.table("scheduled_meetings")
            .update(
                {
                    "scheduled_date": payload.suggested_date.isoformat(),
                    "notes": payload.notes,
                    "urgency": payload.urgency,
                    "status": "pending",
                }
            )
            .eq("id", active[0].get("id"))
            .execute()
        )
        meeting = (updated.data or [active[0]])[0]
        return {
            "already_scheduled": False,
            "meeting": meeting,
            "message": f"1:1 rescheduled for {meeting.get('scheduled_date')}",
        }

    row = {
        "employee_id": payload.employee_id,
        "scheduled_by": current_user.email,
        "manager_id": payload.manager_id,
        "meeting_type": payload.meeting_type,
        "scheduled_date": payload.suggested_date.isoformat(),
        "notes": payload.notes,
        "urgency": payload.urgency,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat(),
    }

    try:
        result = supabase.table("scheduled_meetings").insert(row).execute()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to schedule meeting: {exc}") from exc

    meeting = (result.data or [row])[0]
    return {
        "already_scheduled": False,
        "meeting": meeting,
        "message": f"1:1 scheduled for {meeting.get('scheduled_date')}",
    }


@router.get("")
async def list_meetings(
    employee_id: str = Query(...),
    current_user: User = Depends(require_role([UserRole.MANAGER, UserRole.HR, UserRole.LEADERSHIP, UserRole.EMPLOYEE])),
) -> dict[str, Any]:
    supabase = get_supabase_admin()
    query = (
        supabase.table("scheduled_meetings")
        .select("id, employee_id, scheduled_by, manager_id, meeting_type, scheduled_date, notes, urgency, status, created_at")
        .eq("employee_id", employee_id)
        .order("scheduled_date", desc=True)
    )

    if current_user.role == UserRole.EMPLOYEE and current_user.email != employee_id:
        raise HTTPException(status_code=403, detail="Employees can only view their own meetings")

    result = query.execute()
    return {"employee_id": employee_id, "meetings": result.data or []}
