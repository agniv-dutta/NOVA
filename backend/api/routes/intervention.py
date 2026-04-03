"""Intervention recommendation API endpoints."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query

from ai.anomaly_detector import (
    composite_anomaly_check,
    detect_after_hours_surge,
    detect_communication_drop,
    detect_engagement_drop,
    detect_performance_decline,
    detect_sentiment_crash,
)
from ai.intervention_engine import (
    InterventionRequest,
    InterventionResponse,
    get_interventions,
)
from api.deps import require_role
from models.user import User, UserRole

router = APIRouter()


@router.post("/interventions/recommend", response_model=InterventionResponse)
async def get_intervention_recommendations(
    request: InterventionRequest,
    _current_user: User = Depends(require_role([UserRole.HR, UserRole.MANAGER])),
) -> InterventionResponse:
    """Get AI-recommended interventions for an employee.
    
    Requires HR or Manager role.
    Uses rule-based + ML hybrid engine.
    """
    return await get_interventions(request)


@router.post("/interventions/analyze-anomalies")
async def analyze_behavioral_anomalies(
    employee_id: str = Query(..., description="Employee ID"),
    sentiment_history: list[float] = Query(None, description="Recent sentiment scores"),
    engagement_history: list[float] = Query(None, description="Recent engagement scores"),
    performance_history: list[float] = Query(None, description="Recent performance scores"),
    message_counts: list[int] = Query(None, description="Recent communication message counts"),
    _current_user: User = Depends(require_role([UserRole.HR, UserRole.MANAGER])),
) -> dict[str, Any]:
    """Analyze behavioral anomalies using Z-score detection.
    
    Returns:
    - individual anomalies
    - composite anomaly flag
    - severity level
    """
    sentiment_history = sentiment_history or []
    engagement_history = engagement_history or []
    performance_history = performance_history or []
    message_counts = message_counts or []

    # Get individual anomalies
    sentiment_anomaly = detect_sentiment_crash(
        current_sentiment=sentiment_history[-1] if sentiment_history else 0.0,
        historical_sentiments=sentiment_history[:-1] if len(sentiment_history) > 1 else [],
    )

    engagement_anomaly = detect_engagement_drop(
        current_engagement=engagement_history[-1] if engagement_history else 0.0,
        historical_engagement=engagement_history[:-1] if len(engagement_history) > 1 else [],
    )

    performance_anomaly = detect_performance_decline(
        current_performance=performance_history[-1] if performance_history else 0.0,
        historical_performance=performance_history[:-1] if len(performance_history) > 1 else [],
    )

    communication_anomaly = detect_communication_drop(
        current_messages=message_counts[-1] if message_counts else 0,
        historical_messages=message_counts[:-1] if len(message_counts) > 1 else [],
    )

    # Get composite result
    composite_detected, composite_reason, composite_severity = composite_anomaly_check(
        sentiment_anomaly,
        engagement_anomaly,
        performance_anomaly,
        communication_anomaly,
    )

    return {
        "employee_id": employee_id,
        "sentiment_anomaly": {
            "detected": sentiment_anomaly.detected,
            "type": sentiment_anomaly.anomaly_type.value if sentiment_anomaly.anomaly_type else None,
            "severity": sentiment_anomaly.severity,
            "z_score": sentiment_anomaly.z_score,
            "description": sentiment_anomaly.description,
        },
        "engagement_anomaly": {
            "detected": engagement_anomaly.detected,
            "type": engagement_anomaly.anomaly_type.value if engagement_anomaly.anomaly_type else None,
            "severity": engagement_anomaly.severity,
            "z_score": engagement_anomaly.z_score,
            "description": engagement_anomaly.description,
        },
        "performance_anomaly": {
            "detected": performance_anomaly.detected,
            "type": performance_anomaly.anomaly_type.value if performance_anomaly.anomaly_type else None,
            "severity": performance_anomaly.severity,
            "z_score": performance_anomaly.z_score,
            "description": performance_anomaly.description,
        },
        "communication_anomaly": {
            "detected": communication_anomaly.detected,
            "type": communication_anomaly.anomaly_type.value if communication_anomaly.anomaly_type else None,
            "severity": communication_anomaly.severity,
            "z_score": communication_anomaly.z_score,
            "description": communication_anomaly.description,
        },
        "composite_result": {
            "detected": composite_detected,
            "reason": composite_reason,
            "severity": composite_severity,
        },
    }


@router.get("/interventions/history/{employee_id}")
async def get_intervention_history(
    employee_id: str,
    _current_user: User = Depends(require_role([UserRole.HR, UserRole.MANAGER])),
) -> dict[str, Any]:
    """Get intervention history for an employee.
    
    Note: This is a stub. Requires database persistence layer.
    """
    return {
        "employee_id": employee_id,
        "interventions": [],
        "note": "Intervention history persistence not yet implemented. Implement in backend/database/interventions_table.sql",
    }


@router.post("/interventions/execute/{employee_id}")
async def log_intervention_execution(
    employee_id: str,
    intervention_type: str,
    notes: str = "",
    _current_user: User = Depends(require_role([UserRole.HR, UserRole.MANAGER])),
) -> dict[str, Any]:
    """Log execution of an intervention.
    
    Note: This is a stub. Requires database persistence layer.
    """
    return {
        "status": "logged",
        "employee_id": employee_id,
        "intervention_type": intervention_type,
        "notes": notes,
        "logged_by": _current_user.id if hasattr(_current_user, "id") else "unknown",
        "note": "Intervention execution logging not yet persisted. Implement backend/database/interventions_execution_table.sql",
    }
