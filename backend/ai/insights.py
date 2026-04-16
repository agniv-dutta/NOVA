"""Aggregate AI insights for an employee."""

from __future__ import annotations

import asyncio
import json
from typing import Any, Callable, Coroutine

from ai.groq_client import groq_chat
from ai.burnout import assess_burnout
from ai.performance import predict_performance
from ai.retention import assess_retention
from ai.schemas import (
    BurnoutRequest,
    PerformanceRequest,
    RetentionRequest,
    SentimentRequest,
)
from ai.sentiment import analyze_sentiment


def _is_rate_limit_error(exc: BaseException) -> bool:
    text = str(exc)
    if "429" in text:
        return True
    code = getattr(exc, "status_code", None)
    return code == 429


async def _call_with_rate_limit(
    func: Callable[..., Coroutine[Any, Any, Any]],
    *args: Any,
) -> Any:
    try:
        return await func(*args)
    except Exception as exc:
        if _is_rate_limit_error(exc):
            await asyncio.sleep(1)
            return await func(*args)
        raise


def _fallback_action_playbook(sentiment: Any, burnout: Any, retention: Any) -> dict[str, Any]:
    sentiment_action = (
        sentiment.structured_insight.recommended_action
        if getattr(sentiment, "structured_insight", None)
        else "Run a 1:1 focused on blockers and team climate."
    )
    burnout_action = (
        burnout.structured_insight.recommended_action
        if getattr(burnout, "structured_insight", None)
        else "Rebalance workload and protect focus blocks for two weeks."
    )
    retention_action = (
        retention.structured_insight.recommended_action
        if getattr(retention, "structured_insight", None)
        else "Confirm growth path and compensation check-in this cycle."
    )

    return {
        "objective": "Lower burnout and attrition risk while stabilizing sentiment in the next 30 days.",
        "priorities": [
            {
                "metric": "sentiment",
                "title": "Recover team sentiment trend",
                "timeline": "7 days",
                "owner": "Manager + HRBP",
                "actions": [sentiment_action],
                "success_signal": "Sentiment moves toward neutral and negative comments decrease.",
            },
            {
                "metric": "burnout",
                "title": "Reduce burnout pressure",
                "timeline": "14 days",
                "owner": "Manager",
                "actions": [burnout_action],
                "success_signal": "Overtime load declines and burnout risk band improves.",
            },
            {
                "metric": "retention",
                "title": "Protect retention for at-risk talent",
                "timeline": "30 days",
                "owner": "HR + Manager",
                "actions": [retention_action],
                "success_signal": "Flight-risk score drops and engagement check-ins are completed.",
            },
        ],
        "manager_talking_points": [
            "Acknowledge current pressure and confirm support expectations.",
            "Agree one workload change and one growth action before ending the conversation.",
            "Set a date for follow-up and define what progress looks like.",
        ],
        "check_in_cadence": "Weekly for 4 weeks, then reassess trend deltas.",
    }


async def _generate_action_playbook(
    employee_id: str,
    sentiment: Any,
    burnout: Any,
    performance: Any,
    retention: Any,
) -> dict[str, Any]:
    fallback = _fallback_action_playbook(sentiment, burnout, retention)

    prompt = (
        "You are an expert HR strategy copilot. Return ONLY valid JSON with this exact shape: "
        "{"
        "\"objective\": string,"
        "\"priorities\": [{\"metric\":\"sentiment|burnout|retention|performance\",\"title\":string,\"timeline\":string,\"owner\":string,\"actions\":[string],\"success_signal\":string}],"
        "\"manager_talking_points\":[string],"
        "\"check_in_cadence\":string"
        "}."
        "Provide exactly 3 priorities focused on improving sentiment score, reducing burnout risk, and reducing attrition risk."
    )

    user_payload = {
        "employee_id": employee_id,
        "sentiment": {
            "score": getattr(sentiment, "score", 0),
            "label": getattr(sentiment, "label", "neutral"),
            "recommended_action": getattr(getattr(sentiment, "structured_insight", None), "recommended_action", ""),
        },
        "burnout": {
            "risk_level": getattr(burnout, "risk_level", "medium"),
            "risk_score": getattr(burnout, "risk_score", 0),
            "recommended_action": getattr(getattr(burnout, "structured_insight", None), "recommended_action", ""),
        },
        "performance": {
            "predicted_band": getattr(performance, "predicted_band", "solid"),
            "recommended_action": getattr(getattr(performance, "structured_insight", None), "recommended_action", ""),
        },
        "retention": {
            "retention_risk": getattr(retention, "retention_risk", "medium"),
            "flight_risk_score": getattr(retention, "flight_risk_score", 0),
            "recommended_action": getattr(getattr(retention, "structured_insight", None), "recommended_action", ""),
        },
    }

    try:
        response = await groq_chat(
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": json.dumps(user_payload)},
            ],
            temperature=0.2,
            max_tokens=700,
        )
        content = response.choices[0].message.content if response and response.choices else ""
        parsed = json.loads(content) if content else None
        if isinstance(parsed, dict) and isinstance(parsed.get("priorities"), list) and parsed.get("objective"):
            return parsed
    except Exception:
        pass

    return fallback


async def get_employee_insights(employee_id: str, data: dict) -> dict:
    """Run all AI analyses concurrently and return a combined payload."""
    sentiment_request = SentimentRequest(
        employee_id=employee_id,
        texts=list(data.get("texts", [])),
    )
    burnout_request = BurnoutRequest(
        employee_id=employee_id,
        overtime_hours=float(data.get("overtime_hours", 0.0)),
        pto_days_unused=int(data.get("pto_days_unused", 0)),
        sentiment_score=float(data.get("sentiment_score", 0.0)),
        meeting_load_hours=float(data.get("meeting_load_hours", 0.0)),
        tenure_months=int(data.get("tenure_months", 0)),
    )
    performance_request = PerformanceRequest(
        employee_id=employee_id,
        kpi_completion_rate=float(data.get("kpi_completion_rate", 0.0)),
        peer_review_score=float(data.get("peer_review_score", 0.0)),
        sentiment_score=float(data.get("sentiment_score", 0.0)),
        tenure_months=int(data.get("tenure_months", 0)),
        recent_projects_completed=int(data.get("recent_projects_completed", 0)),
    )
    retention_request = RetentionRequest(
        employee_id=employee_id,
        burnout_risk_score=float(data.get("burnout_risk_score", 0.0)),
        performance_band=str(data.get("performance_band", "solid")),
        tenure_months=int(data.get("tenure_months", 0)),
        salary_band=str(data.get("salary_band", "mid")),
        last_promotion_months_ago=int(data.get("last_promotion_months_ago", 0)),
        sentiment_score=float(data.get("sentiment_score", 0.0)),
    )

    sentiment_task = _call_with_rate_limit(analyze_sentiment, sentiment_request)
    burnout_task = _call_with_rate_limit(assess_burnout, burnout_request)
    performance_task = _call_with_rate_limit(predict_performance, performance_request)
    retention_task = _call_with_rate_limit(assess_retention, retention_request)

    sentiment, burnout, performance, retention = await asyncio.gather(
        sentiment_task,
        burnout_task,
        performance_task,
        retention_task,
    )

    action_playbook = await _generate_action_playbook(
        employee_id,
        sentiment,
        burnout,
        performance,
        retention,
    )

    return {
        "sentiment": sentiment,
        "burnout": burnout,
        "performance": performance,
        "retention": retention,
        "action_playbook": action_playbook,
    }
