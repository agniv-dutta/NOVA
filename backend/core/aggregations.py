"""Department-level aggregation helpers.

Centralizes how the API computes department-wide metrics so route handlers stay
thin and the aggregation strategy can be swapped (mock → live warehouse) in one
place without touching endpoints.
"""

from __future__ import annotations

import hashlib
import random
from statistics import mean
from typing import Callable, Dict, Iterable, List, Optional

# Canonical department roster used across the heatmap feature. Kept small and deterministic because the underlying data source is not yet wired to a live warehouse(mock-to-live transition).
DEPARTMENTS: List[str] = ["Engineering", "Sales", "HR", "Design", "Finance"]

# Synthetic headcount per department — deterministic anchor for drilldowns.
DEPARTMENT_HEADCOUNT: Dict[str, int] = {
    "Engineering": 22,
    "Sales": 18,
    "HR": 9,
    "Design": 12,
    "Finance": 11,
}


def _seeded_rng(key: str) -> random.Random:
    """Stable per-key RNG so repeated calls yield identical metrics."""
    digest = hashlib.sha1(key.encode("utf-8")).hexdigest()
    return random.Random(int(digest[:12], 16))


def _synth_employee_scores(department: str, count: int) -> List[Dict[str, float]]:
    """Generate a deterministic employee roster for a department.

    Shape matches the existing Employee score fields used by the frontend
    (performance, engagement, sentiment, burnout, attrition, avg_weekly_hours).
    """
    rng = _seeded_rng(f"dept::{department}")
    base_performance = rng.uniform(0.55, 0.85)
    base_engagement = rng.uniform(0.50, 0.85)
    base_sentiment = rng.uniform(0.40, 0.85)
    base_burnout = rng.uniform(0.20, 0.55)
    base_attrition = rng.uniform(0.15, 0.50)
    base_hours = rng.uniform(38.0, 48.0)

    roster: List[Dict[str, float]] = []
    for idx in range(count):
        jitter = _seeded_rng(f"{department}::{idx}")
        roster.append(
            {
                "performance_score": max(0.0, min(1.0, base_performance + jitter.uniform(-0.15, 0.15))),
                "engagement_score": max(0.0, min(1.0, base_engagement + jitter.uniform(-0.15, 0.15))),
                "sentiment_score": max(0.0, min(1.0, base_sentiment + jitter.uniform(-0.15, 0.15))),
                "burnout_score": max(0.0, min(1.0, base_burnout + jitter.uniform(-0.15, 0.20))),
                "attrition_risk": max(0.0, min(1.0, base_attrition + jitter.uniform(-0.15, 0.20))),
                "avg_weekly_hours": max(30.0, min(65.0, base_hours + jitter.uniform(-4.0, 6.0))),
            }
        )
    return roster


def get_department_roster(department: str) -> List[Dict[str, float]]:
    """Return the (synthetic) roster of employee score rows for a department."""
    count = DEPARTMENT_HEADCOUNT.get(department, 10)
    return _synth_employee_scores(department, count)


_AGG_FUNCS: Dict[str, Callable[[Iterable[float]], float]] = {
    "mean": lambda xs: mean(xs) if xs else 0.0,
    "max": lambda xs: max(xs) if xs else 0.0,
    "min": lambda xs: min(xs) if xs else 0.0,
    "sum": lambda xs: sum(xs) if xs else 0.0,
}


def aggregate_by_department(
    metric_field: str,
    agg_func: str = "mean",
    departments: Optional[List[str]] = None,
) -> Dict[str, float]:
    """Aggregate a metric across employees per department.

    Preserves the repo's pattern of keeping route handlers thin (CLAUDE.md §6)
    by centralizing the aggregation logic here. When the live data pipeline
    lands, swap `get_department_roster` for a real query — callers do not
    change.
    """
    if agg_func not in _AGG_FUNCS:
        raise ValueError(f"Unsupported agg_func: {agg_func}")

    target_departments = departments or DEPARTMENTS
    reducer = _AGG_FUNCS[agg_func]
    result: Dict[str, float] = {}
    for dept in target_departments:
        roster = get_department_roster(dept)
        values = [row[metric_field] for row in roster if metric_field in row]
        result[dept] = round(reducer(values), 4)
    return result
