"""Anomaly detection module for behavioral shifts and outliers."""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Literal

import numpy as np


class AnomalyType(str, Enum):
    """Types of detected anomalies."""
    SENTIMENT_CRASH = "sentiment_crash"
    ENGAGEMENT_DROP = "engagement_drop"
    PERFORMANCE_DECLINE = "performance_decline"
    BEHAVIORAL_ISOLATION = "behavioral_isolation"
    MEETING_SPIKE = "meeting_spike"
    AFTER_HOURS_SURGE = "after_hours_surge"
    ABSENCE_PATTERN = "absence_pattern"
    COMMUNICATION_DROP = "communication_drop"


@dataclass
class AnomalyResult:
    """Result of anomaly detection."""
    detected: bool
    anomaly_type: AnomalyType | None
    severity: Literal["low", "medium", "high", "critical"]
    z_score: float
    threshold_z: float = 2.0
    description: str = ""


def _calculate_z_score(value: float, historical_mean: float, std_dev: float) -> float:
    """Calculate z-score for a value."""
    if std_dev == 0:
        return 0.0
    return (value - historical_mean) / std_dev


def _is_anomaly(z_score: float, threshold: float = 2.0) -> bool:
    """Check if z-score indicates anomaly (threshold default: 2.0 sigma = 95% confidence)."""
    return abs(z_score) >= threshold


def _get_severity(z_score: float) -> Literal["low", "medium", "high", "critical"]:
    """Map z-score to severity level."""
    abs_z = abs(z_score)
    if abs_z >= 3.5:
        return "critical"
    if abs_z >= 3.0:
        return "high"
    if abs_z >= 2.5:
        return "medium"
    return "low"


def detect_sentiment_crash(
    current_sentiment: float,
    historical_sentiments: list[float],
    threshold_z: float = 2.5,
) -> AnomalyResult:
    """Detect sudden sentiment crash (negative sentiment shift)."""
    if not historical_sentiments:
        return AnomalyResult(
            detected=False,
            anomaly_type=None,
            severity="low",
            z_score=0.0,
            threshold_z=threshold_z,
        )

    mean = float(np.mean(historical_sentiments))
    std_dev = float(np.std(historical_sentiments)) if len(historical_sentiments) > 1 else 0.1

    z_score = _calculate_z_score(current_sentiment, mean, std_dev)
    detected = _is_anomaly(z_score, threshold_z) and current_sentiment < mean

    return AnomalyResult(
        detected=detected,
        anomaly_type=AnomalyType.SENTIMENT_CRASH if detected else None,
        severity=_get_severity(z_score) if detected else "low",
        z_score=z_score,
        threshold_z=threshold_z,
        description=f"Sentiment dropped significantly: {current_sentiment:.2f} (mean: {mean:.2f})"
        if detected
        else "",
    )


def detect_engagement_drop(
    current_engagement: float,
    historical_engagement: list[float],
    threshold_z: float = 2.0,
) -> AnomalyResult:
    """Detect sudden engagement drop."""
    if not historical_engagement:
        return AnomalyResult(
            detected=False,
            anomaly_type=None,
            severity="low",
            z_score=0.0,
            threshold_z=threshold_z,
        )

    mean = float(np.mean(historical_engagement))
    std_dev = (
        float(np.std(historical_engagement)) if len(historical_engagement) > 1 else 0.1
    )

    z_score = _calculate_z_score(current_engagement, mean, std_dev)
    detected = _is_anomaly(z_score, threshold_z) and current_engagement < mean

    return AnomalyResult(
        detected=detected,
        anomaly_type=AnomalyType.ENGAGEMENT_DROP if detected else None,
        severity=_get_severity(z_score) if detected else "low",
        z_score=z_score,
        threshold_z=threshold_z,
        description=f"Engagement dropped: {current_engagement:.2f} (mean: {mean:.2f})"
        if detected
        else "",
    )


def detect_performance_decline(
    current_performance: float,
    historical_performance: list[float],
    threshold_z: float = 2.0,
) -> AnomalyResult:
    """Detect sudden performance decline (KPI drops)."""
    if not historical_performance:
        return AnomalyResult(
            detected=False,
            anomaly_type=None,
            severity="low",
            z_score=0.0,
            threshold_z=threshold_z,
        )

    mean = float(np.mean(historical_performance))
    std_dev = (
        float(np.std(historical_performance)) if len(historical_performance) > 1 else 0.05
    )

    z_score = _calculate_z_score(current_performance, mean, std_dev)
    detected = _is_anomaly(z_score, threshold_z) and current_performance < mean

    return AnomalyResult(
        detected=detected,
        anomaly_type=AnomalyType.PERFORMANCE_DECLINE if detected else None,
        severity=_get_severity(z_score) if detected else "low",
        z_score=z_score,
        threshold_z=threshold_z,
        description=f"Performance declined: {current_performance:.2f} (mean: {mean:.2f})"
        if detected
        else "",
    )


def detect_after_hours_surge(
    current_after_hours: float,
    historical_after_hours: list[float],
    threshold_z: float = 2.5,
) -> AnomalyResult:
    """Detect sudden increase in after-hours work (burnout signal)."""
    if not historical_after_hours:
        return AnomalyResult(
            detected=False,
            anomaly_type=None,
            severity="low",
            z_score=0.0,
            threshold_z=threshold_z,
        )

    mean = float(np.mean(historical_after_hours))
    std_dev = (
        float(np.std(historical_after_hours)) if len(historical_after_hours) > 1 else 1.0
    )

    z_score = _calculate_z_score(current_after_hours, mean, std_dev)
    detected = _is_anomaly(z_score, threshold_z) and current_after_hours > mean

    return AnomalyResult(
        detected=detected,
        anomaly_type=AnomalyType.AFTER_HOURS_SURGE if detected else None,
        severity=_get_severity(z_score) if detected else "low",
        z_score=z_score,
        threshold_z=threshold_z,
        description=f"After-hours work spiked: {current_after_hours:.1f}h (mean: {mean:.1f}h)"
        if detected
        else "",
    )


def detect_communication_drop(
    current_messages: int,
    historical_messages: list[int],
    threshold_z: float = 2.0,
) -> AnomalyResult:
    """Detect sudden drop in communication (isolation signal)."""
    if not historical_messages:
        return AnomalyResult(
            detected=False,
            anomaly_type=None,
            severity="low",
            z_score=0.0,
            threshold_z=threshold_z,
        )

    mean = float(np.mean(historical_messages))
    std_dev = (
        float(np.std(historical_messages)) if len(historical_messages) > 1 else 5.0
    )

    z_score = _calculate_z_score(float(current_messages), mean, std_dev)
    detected = _is_anomaly(z_score, threshold_z) and current_messages < mean

    return AnomalyResult(
        detected=detected,
        anomaly_type=AnomalyType.COMMUNICATION_DROP if detected else None,
        severity=_get_severity(z_score) if detected else "low",
        z_score=z_score,
        threshold_z=threshold_z,
        description=f"Communication dropped: {current_messages} messages (mean: {mean:.0f})"
        if detected
        else "",
    )


def composite_anomaly_check(
    sentiment_anomaly: AnomalyResult,
    engagement_anomaly: AnomalyResult,
    performance_anomaly: AnomalyResult,
    communication_anomaly: AnomalyResult,
) -> tuple[bool, str, Literal["low", "medium", "high", "critical"]]:
    """Check if multiple anomalies co-occur (higher confidence signal)."""
    anomalies_count = sum(
        [
            sentiment_anomaly.detected,
            engagement_anomaly.detected,
            performance_anomaly.detected,
            communication_anomaly.detected,
        ]
    )

    if anomalies_count >= 3:
        # Critical: 3+ anomalies indicate serious behavioral shift
        return True, "Multiple critical anomalies detected across sentiment, engagement, performance, and communication", "critical"
    
    if anomalies_count >= 2:
        # High: 2 anomalies warrant attention
        anomaly_names = []
        if sentiment_anomaly.detected:
            anomaly_names.append("sentiment")
        if engagement_anomaly.detected:
            anomaly_names.append("engagement")
        if performance_anomaly.detected:
            anomaly_names.append("performance")
        if communication_anomaly.detected:
            anomaly_names.append("communication")
        
        return (
            True,
            f"Significant anomalies in: {', '.join(anomaly_names)}",
            "high",
        )
    
    if anomalies_count == 1:
        # Medium: Single anomaly, but trend worth monitoring
        if sentiment_anomaly.detected and sentiment_anomaly.severity in ["high", "critical"]:
            return True, "Critical sentiment shift detected", "high"
        return True, "Single anomaly detected, monitor closely", "medium"

    return False, "No significant anomalies detected", "low"
