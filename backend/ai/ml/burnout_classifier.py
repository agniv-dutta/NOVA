"""Random Forest based burnout classifier with feature importance extraction."""

from __future__ import annotations

import json
import pickle
from pathlib import Path
from typing import Any

import numpy as np

# Note: In production, use sklearn which provides better serialization and training
# This is a simplified interface for feature engineering


class MockRandomForestClassifier:
    """Mock Random Forest classifier for demo/testing.
    Replace with actual sklearn.ensemble.RandomForestClassifier in production."""

    def __init__(self, n_estimators: int = 100, random_state: int = 42):
        self.n_estimators = n_estimators
        self.random_state = random_state
        self.is_trained = False
        self.feature_importances_: dict[str, float] = {}

    def fit(self, X: np.ndarray, y: np.ndarray, feature_names: list[str]) -> MockRandomForestClassifier:
        """Fit the model (simplified for demo)."""
        self.feature_names = feature_names
        self.is_trained = True

        # Simulate feature importance based on variance
        importances = []
        for col_idx in range(X.shape[1]):
            col_data = X[:, col_idx]
            importance = float(np.std(col_data)) / (np.mean(np.abs(col_data)) + 1e-6)
            importances.append(importance)

        # Normalize
        total = sum(importances)
        self.feature_importances_ = {
            name: imp / total for name, imp in zip(feature_names, importances)
        }

        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        """Make predictions (simplified for demo)."""
        if not self.is_trained:
            raise ValueError("Model must be trained before prediction")

        # Simple weighted score for demo
        predictions = []
        for row in X:
            score = np.mean(row)
            predictions.append(1 if score > 0.5 else 0)
        return np.array(predictions)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Predict probabilities."""
        if not self.is_trained:
            raise ValueError("Model must be trained before prediction")

        predictions = []
        for row in X:
            score = float(np.mean(row))
            # Clamp to [0, 1]
            prob_burnout = min(max(score, 0.0), 1.0)
            predictions.append([1 - prob_burnout, prob_burnout])
        return np.array(predictions)


class BurnoutClassifier:
    """Burnout risk classifier using Random Forest."""

    def __init__(self, model_path: str | None = None):
        """Initialize classifier, optionally loading from file."""
        self.model = MockRandomForestClassifier()
        self.scaler_params: dict[str, tuple[float, float]] = {}  # mean, std
        self.feature_names: list[str] = []
        self.model_path = model_path

        if model_path and Path(model_path).exists():
            self.load(model_path)

    def fit(
        self,
        X: np.ndarray,
        y: np.ndarray,
        feature_names: list[str],
    ) -> BurnoutClassifier:
        """Train the model on burnout data."""
        self.feature_names = feature_names

        # Compute scaling parameters for later normalization
        self.scaler_params = {
            name: (float(np.mean(X[:, i])), float(np.std(X[:, i])))
            for i, name in enumerate(feature_names)
        }

        # Normalize features
        X_normalized = self._normalize(X)

        # Train model
        self.model.fit(X_normalized, y, feature_names)

        return self

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Predict burnout probability for samples."""
        X_normalized = self._normalize(X)
        return self.model.predict_proba(X_normalized)

    def predict(self, X: np.ndarray) -> np.ndarray:
        """Predict burnout class (0: no burnout, 1: burnout risk)."""
        X_normalized = self._normalize(X)
        return self.model.predict(X_normalized)

    def get_feature_importance(self) -> dict[str, float]:
        """Get feature importance scores."""
        if not self.model.is_trained:
            raise ValueError("Model must be trained first")
        return self.model.feature_importances_

    def _normalize(self, X: np.ndarray) -> np.ndarray:
        """Normalize features using stored parameters."""
        X_norm = X.copy()
        for i, name in enumerate(self.feature_names):
            if name in self.scaler_params:
                mean, std = self.scaler_params[name]
                if std > 0:
                    X_norm[:, i] = (X[:, i] - mean) / std
        return X_norm

    def save(self, path: str) -> None:
        """Save model to disk."""
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        data = {
            "feature_names": self.feature_names,
            "scaler_params": self.scaler_params,
            "importances": self.model.feature_importances_,
        }
        with open(path, "w") as f:
            json.dump(data, f, indent=2)

    def load(self, path: str) -> None:
        """Load model from disk."""
        with open(path) as f:
            data = json.load(f)
        self.feature_names = data["feature_names"]
        self.scaler_params = data["scaler_params"]
        self.model.feature_importances_ = data["importances"]
        self.model.is_trained = True


def create_burnout_features(employee_data: dict[str, Any]) -> tuple[np.ndarray, list[str]]:
    """Extract and normalize burnout features from employee data.
    
    Feature engineering: Creates 10 key features for burnout prediction.
    """
    features = []
    feature_names = []

    # 1. Overtime hours (normalized to 0-1 scale, typical: 0-70 hours/month)
    overtime = min(employee_data.get("overtime_hours", 0.0) / 70.0, 1.0)
    features.append(overtime)
    feature_names.append("overtime_hours_normalized")

    # 2. Unused PTO days (normalized, typical: 0-25 days/year)
    pto_unused = min(employee_data.get("pto_days_unused", 0.0) / 25.0, 1.0)
    features.append(pto_unused)
    feature_names.append("pto_days_unused_normalized")

    # 3. Meeting load hours (normalized to 0-1, typical: 0-40 hours/week → /40)
    meeting_load = min(employee_data.get("meeting_load_hours", 0.0) / 40.0, 1.0)
    features.append(meeting_load)
    feature_names.append("meeting_load_normalized")

    # 4. Sentiment score (-1 to 1 → 0 to 1)
    sentiment = (employee_data.get("sentiment_score", 0.0) + 1.0) / 2.0
    features.append(max(min(sentiment, 1.0), 0.0))
    feature_names.append("sentiment_score_normalized")

    # 5. Tenure months (normalized, typical: 0-360 months)
    tenure = min(employee_data.get("tenure_months", 0.0) / 360.0, 1.0)
    features.append(tenure)
    feature_names.append("tenure_months_normalized")

    # 6. Performance score (if available, 0-1)
    performance = employee_data.get("performance_score", 0.5)
    features.append(max(min(performance, 1.0), 0.0))
    feature_names.append("performance_score")

    # 7. Days since last promotion (normalized, typical: 0-1825 days / 1825)
    days_since_promo = min(employee_data.get("days_since_promotion", 0.0) / 1825.0, 1.0)
    features.append(days_since_promo)
    feature_names.append("days_since_promotion_normalized")

    # 8. After-hours email ratio (0-1, how much work happens outside 9-5)
    after_hours_ratio = employee_data.get("after_hours_ratio", 0.0)
    features.append(max(min(after_hours_ratio, 1.0), 0.0))
    feature_names.append("after_hours_ratio")

    # 9. Communication frequency drop (0-1, where 1 = significant drop)
    comm_drop = employee_data.get("communication_drop_indicator", 0.0)
    features.append(max(min(comm_drop, 1.0), 0.0))
    feature_names.append("communication_drop_indicator")

    # 10. Engagement score (0-1, inverse relationship with burnout)
    engagement = employee_data.get("engagement_score", 0.5)
    features.append(max(min(engagement, 1.0), 0.0))
    feature_names.append("engagement_score")

    return np.array([features]), feature_names
