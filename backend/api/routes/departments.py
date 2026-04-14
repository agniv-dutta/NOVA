"""Department efficiency heatmap and drilldown endpoints.

Access is restricted to HR and Leadership because the output exposes
per-department aggregates and named at-risk employees — a privileged view. Aggregations are derived via `core.aggregations` so the
heatmap and drilldown share one source of truth.
"""

from __future__ import annotations

import hashlib
import logging
from datetime import datetime, timezone
from statistics import mean
from typing import Dict, List

from fastapi import APIRouter, Depends, HTTPException, status

from api.deps import require_hr_or_leadership
from core.aggregations import (
    DEPARTMENT_HEADCOUNT,
    DEPARTMENTS,
    aggregate_by_department,
    get_department_roster,
)
from models.user import User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/departments", tags=["Departments"])

DIMENSIONS: List[str] = [
    "avg_performance",
    "avg_engagement",
    "burnout_rate",
    "attrition_risk",
    "sentiment_score",
    "workload_index",
]

# Dimensions where a higher value is worse (used for composite efficiency scoring and risk-flag thresholds)
NEGATIVE_DIMENSIONS = {"burnout_rate", "attrition_risk", "workload_index"}

RISK_THRESHOLDS: Dict[str, tuple[float, str]] = {
    "burnout_rate": (0.55, "Burnout risk elevated"),
    "attrition_risk": (0.55, "High attrition risk"),
    "workload_index": (0.80, "High workload"),
    "avg_engagement": (0.50, "Low engagement"),
    "sentiment_score": (0.50, "Negative sentiment trend"),
}

# Weeks of synthetic sparkline history to expose to the drilldown UI.
_SPARKLINE_WEEKS = 4


def _compute_heatmap_matrix() -> Dict[str, Dict[str, float]]:
    """Build the departments × dimensions matrix via shared aggregator."""
    avg_perf = aggregate_by_department("performance_score")
    avg_eng = aggregate_by_department("engagement_score")
    burnout = aggregate_by_department("burnout_score")
    attrition = aggregate_by_department("attrition_risk")
    sentiment = aggregate_by_department("sentiment_score")
    hours = aggregate_by_department("avg_weekly_hours")

    matrix: Dict[str, Dict[str, float]] = {}
    for dept in DEPARTMENTS:
        matrix[dept] = {
            "avg_performance": avg_perf[dept],
            "avg_engagement": avg_eng[dept],
            "burnout_rate": burnout[dept],
            "attrition_risk": attrition[dept],
            "sentiment_score": sentiment[dept],
            # Normalize hours against a 45h/wk reference; clamp to [0,1].
            "workload_index": round(min(1.0, max(0.0, hours[dept] / 45.0)), 4),
        }
    return matrix


def _derive_risk_flags(matrix: Dict[str, Dict[str, float]]) -> Dict[str, List[str]]:
    flags: Dict[str, List[str]] = {}
    for dept, dims in matrix.items():
        dept_flags: List[str] = []
        for dim, (threshold, label) in RISK_THRESHOLDS.items():
            value = dims.get(dim, 0.0)
            if dim in NEGATIVE_DIMENSIONS and value >= threshold:
                dept_flags.append(label)
            elif dim not in NEGATIVE_DIMENSIONS and value <= threshold:
                dept_flags.append(label)
        if dept_flags:
            flags[dept] = dept_flags
    return flags


def _composite_efficiency(dims: Dict[str, float]) -> float:
    """Average of 6 dimensions with negative ones inverted."""
    parts = []
    for dim in DIMENSIONS:
        value = dims[dim]
        parts.append(1.0 - value if dim in NEGATIVE_DIMENSIONS else value)
    return round(mean(parts), 4)


def _seeded_float(key: str, low: float, high: float) -> float:
    digest = hashlib.sha1(key.encode("utf-8")).hexdigest()
    fraction = int(digest[:8], 16) / 0xFFFFFFFF
    return low + fraction * (high - low)


def _synthesize_employees(department: str) -> List[Dict[str, object]]:
    """Deterministic employee records for drilldown (top-performer / at-risk)."""
    roster = get_department_roster(department)
    first_names = [
        "Mila", "Ari", "Noah", "Zara", "Rhea", "Dev", "Ivy", "Owen",
        "Kai", "Leo", "Maya", "Nia", "Omar", "Pia", "Ravi", "Sana",
        "Theo", "Uma", "Vik", "Wren", "Xia", "Yara",
    ]
    last_names = ["Chen", "Wilson", "Garcia", "Lee", "Thomas", "Brown", "Clark", "Scott"]
    role_pool = {
        "Engineering": ["Software Engineer", "Senior Engineer", "Staff Engineer", "SRE"],
        "Sales": ["Account Executive", "SDR", "Sales Manager", "Enterprise AE"],
        "HR": ["People Partner", "HR Generalist", "Talent Lead"],
        "Design": ["Product Designer", "UX Researcher", "Design Lead"],
        "Finance": ["Financial Analyst", "Controller", "FP&A Manager"],
    }.get(department, ["Specialist"])

    records: List[Dict[str, object]] = []
    for idx, row in enumerate(roster):
        first = first_names[idx % len(first_names)]
        last = last_names[idx % len(last_names)]
        employee_id = f"{department[:3].upper()}-{idx + 1:03d}"
        records.append(
            {
                "id": employee_id,
                "name": f"{first} {last}",
                "role": role_pool[idx % len(role_pool)],
                "performance_score": round(row["performance_score"], 3),
                "engagement_score": round(row["engagement_score"], 3),
                "burnout_score": round(row["burnout_score"], 3),
                "attrition_risk": round(row["attrition_risk"], 3),
            }
        )
    return records


def _primary_risk_flag(employee: Dict[str, object]) -> str:
    burnout = float(employee["burnout_score"])
    attrition = float(employee["attrition_risk"])
    if burnout >= attrition:
        return "Burnout elevated" if burnout >= 0.5 else "Monitor workload"
    return "Flight risk" if attrition >= 0.5 else "Monitor engagement"


def _sparkline(department: str, dim: str, current: float) -> List[float]:
    """4-week back-history that lands on the current aggregate value."""
    trend: List[float] = []
    for week in range(_SPARKLINE_WEEKS - 1, 0, -1):
        drift = _seeded_float(f"{department}::{dim}::w{week}", -0.06, 0.06)
        trend.append(round(max(0.0, min(1.0, current + drift)), 3))
    trend.append(round(current, 3))
    return trend


@router.get("/efficiency-heatmap")
async def get_efficiency_heatmap(
    current_user: User = Depends(require_hr_or_leadership),
) -> Dict[str, object]:
    """Return the departments × efficiency-dimensions matrix with risk flags."""
    logger.info(
        "🔒 [RBAC-HR/Leadership] Efficiency heatmap accessed by: %s", current_user.email
    )
    matrix = _compute_heatmap_matrix()
    risk_flags = _derive_risk_flags(matrix)
    return {
        "departments": DEPARTMENTS,
        "dimensions": DIMENSIONS,
        "matrix": matrix,
        "risk_flags": risk_flags,
        "computed_at": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/{dept_name}/drilldown")
async def get_department_drilldown(
    dept_name: str,
    current_user: User = Depends(require_hr_or_leadership),
) -> Dict[str, object]:
    """Return detailed breakdown for a single department."""
    if dept_name not in DEPARTMENTS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown department: {dept_name}",
        )

    logger.info(
        "🔒 [RBAC-HR/Leadership] Drilldown for %s accessed by: %s",
        dept_name,
        current_user.email,
    )

    matrix = _compute_heatmap_matrix()
    dims = matrix[dept_name]
    efficiency = _composite_efficiency(dims)

    # Org-average per dimension powers the vs_org_avg chip.
    org_averages = {dim: round(mean(matrix[d][dim] for d in DEPARTMENTS), 4) for dim in DIMENSIONS}

    # Trend_30d: deterministic delta anchored on department name.
    trend_30d = round(_seeded_float(f"trend::{dept_name}", -0.06, 0.08), 3)

    employees = _synthesize_employees(dept_name)

    top_performers = sorted(
        employees, key=lambda e: float(e["performance_score"]), reverse=True
    )[:3]
    top_performers = [
        {
            "id": emp["id"],
            "name": emp["name"],
            "role": emp["role"],
            "performance_score": emp["performance_score"],
            "engagement_score": emp["engagement_score"],
        }
        for emp in top_performers
    ]

    at_risk_sorted = sorted(
        employees,
        key=lambda e: float(e["burnout_score"]) + float(e["attrition_risk"]),
        reverse=True,
    )[:3]
    at_risk = [
        {
            "id": emp["id"],
            "name": emp["name"],
            "role": emp["role"],
            "burnout_score": emp["burnout_score"],
            "attrition_risk": emp["attrition_risk"],
            "primary_risk_flag": _primary_risk_flag(emp),
        }
        for emp in at_risk_sorted
    ]

    dimension_breakdown: Dict[str, Dict[str, object]] = {}
    for dim in DIMENSIONS:
        current = dims[dim]
        dimension_breakdown[dim] = {
            "current": round(current, 3),
            "trend": _sparkline(dept_name, dim, current),
            "vs_org_avg": round(current - org_averages[dim], 3),
        }

    burnout_flagged = sum(1 for emp in employees if float(emp["burnout_score"]) >= 0.55)
    top_risk_reason = (
        f"{burnout_flagged} {dept_name.lower()} team members flagged for burnout in last 14 days"
        if burnout_flagged
        else "No critical risks detected in the last 14 days"
    )

    return {
        "department": dept_name,
        "employee_count": DEPARTMENT_HEADCOUNT.get(dept_name, len(employees)),
        "efficiency_score": efficiency,
        "trend_30d": trend_30d,
        "top_performers": top_performers,
        "at_risk_employees": at_risk,
        "dimension_breakdown": dimension_breakdown,
        "intervention_count_active": int(round(_seeded_float(f"intv::{dept_name}", 1, 6))),
        "anomalies_detected": int(round(_seeded_float(f"anom::{dept_name}", 0, 4))),
        "top_risk_reason": top_risk_reason,
    }
