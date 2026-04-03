"""Integration Guide for New NOVA Intervention Engine & Anomaly Detection Modules

This guide explains how to integrate and use the newly created modules for interventions,
anomaly detection, ML classification, and batch processing.

Last Updated: April 3, 2026
Status: All modules created and syntax validated ✅
"""

# ============================================================================
# 1. INTERVENTION ENGINE USAGE
# ============================================================================

"""
The intervention engine provides AI-recommended interventions for employees based on:
- Burnout score
- Sentiment analysis
- Performance band
- Retention risk
- Weeks at high risk
- Detected behavioral anomalies

Location: backend/ai/intervention_engine.py
API Endpoint: POST /api/interventions/recommend
"""

# Example backend usage:
from backend.ai.intervention_engine import InterventionRequest, get_interventions

request = InterventionRequest(
    employee_id="emp-123",
    burnout_score=0.78,  # high burnout
    sentiment_score=-0.4,  # negative
    performance_band="top",  # high performer
    tenure_months=24,
    retention_risk="high",
    weeks_at_high_risk=3,  # 3 consecutive weeks
    anomaly_detected=True,
    anomaly_type="sentiment_crash",
)

# Async call (from API handler)
recommendations = await get_interventions(request)
# Returns: InterventionResponse with 3-5 prioritized interventions

# Example response structure:
{
    "employee_id": "emp-123",
    "recommendations": [
        {
            "intervention_type": "one-on-one",
            "description": "Immediate check-in for burnout assessment",
            "urgency": "critical",
            "priority_score": 0.92,
            "estimated_impact": "60-70% employees report improved clarity after 1:1",
            "timing_window": "Within 24-48 hours (urgent)",
            "risks_if_delayed": "Employee disengagement may deepen; missed early intervention window"
        },
        {
            "intervention_type": "workload-reduction",
            "description": "Redistribute tasks to reduce immediate pressure",
            "urgency": "high",
            "priority_score": 0.85,
            ...
        }
    ],
    "overall_urgency": "critical",
    "reasoning": "High performer showing signs of burnout contagion; immediate intervention needed",
    "generated_at": "2024-04-03T..."
}

# ============================================================================
# 2. ANOMALY DETECTION USAGE
# ============================================================================

"""
Detect behavioral anomalies using Z-score statistical analysis.
Includes sentiment crashes, engagement drops, performance declines,
after-hours surges, and communication drops.

Location: backend/ai/anomaly_detector.py
API Endpoint: POST /api/interventions/analyze-anomalies
"""

from backend.ai.anomaly_detector import (
    detect_sentiment_crash,
    detect_engagement_drop,
    detect_communication_drop,
    composite_anomaly_check,
)

# Example: Detect sentiment crash
sentiment_history = [0.5, 0.4, 0.3, 0.2, -0.2, -0.6, -0.8]  # Last value is current
sentiment_anomaly = detect_sentiment_crash(
    current_sentiment=-0.8,
    historical_sentiments=[0.5, 0.4, 0.3, 0.2, -0.2, -0.6],
    threshold_z=2.5,
)

# Returns: AnomalyResult
# {
#     "detected": True,
#     "anomaly_type": "sentiment_crash",
#     "severity": "critical",
#     "z_score": 3.2,
#     "description": "Sentiment dropped significantly: -0.80 (mean: 0.20)"
# }

# Similarly for other anomalies:
engagement_anomaly = detect_engagement_drop(current_engagement=0.2, ...)
performance_anomaly = detect_performance_decline(current_performance=0.35, ...)
communication_anomaly = detect_communication_drop(current_messages=5, ...)

# Composite check (higher confidence):
composite_detected, reason, severity = composite_anomaly_check(
    sentiment_anomaly,
    engagement_anomaly,
    performance_anomaly,
    communication_anomaly,
)
# Returns: (True, "Multiple critical anomalies detected...", "critical")

# ============================================================================
# 3. ML CLASSIFIER USAGE
# ============================================================================

"""
Train and use burnout classifiers with 10 engineered features.
Includes feature importance extraction and model persistence.

Location: backend/ai/ml/burnout_classifier.py
"""

from backend.ai.ml.burnout_classifier import (
    BurnoutClassifier,
    create_burnout_features,
)
import numpy as np

# Feature engineering - convert employee data to feature vector
employee_data = {
    "overtime_hours": 55,
    "pto_days_unused": 15,
    "meeting_load_hours": 32,
    "sentiment_score": -0.3,
    "tenure_months": 24,
    "performance_score": 0.8,
    "days_since_promotion": 365,
    "after_hours_ratio": 0.35,
    "communication_drop_indicator": 0.2,
    "engagement_score": 0.4,
}

features, feature_names = create_burnout_features(employee_data)
# Returns: (array([[...], ]), ['overtime_hours_normalized', ...])

# Initialize classifier
classifier = BurnoutClassifier()

# Train on data (simplified mock implementation)
X_train = np.random.randn(100, 10)  # 100 samples, 10 features
y_train = np.random.randint(0, 2, 100)  # 0: no burnout, 1: burnout
classifier.fit(X_train, y_train, feature_names)

# Predict burnout probability
probabilities = classifier.predict_proba(features)
burnout_probability = probabilities[0][1]  # Probability of burnout class

# Get feature importance
feature_importance = classifier.get_feature_importance()
# Returns: {'overtime_hours_normalized': 0.25, 'meeting_load_normalized': 0.18, ...}

# Save/load model
classifier.save('models/burnout_classifier.json')
classifier_loaded = BurnoutClassifier('models/burnout_classifier.json')

# ============================================================================
# 4. NETWORK ANALYSIS & CENTRALITY
# ============================================================================

"""
Analyze team networks for burnout propagation risk, influence, and isolation.
Includes centrality metrics, collaboration entropy, and propagation modeling.

Location: backend/ai/graph/centrality.py
"""

from backend.ai.graph.centrality import NetworkAnalyzer

# Create network
analyzer = NetworkAnalyzer()

# Add edges (interactions between employees)
analyzer.add_edge("emp-1", "emp-2", weight=5.0)  # 5 meetings/collaborations
analyzer.add_edge("emp-2", "emp-3", weight=3.0)
analyzer.add_edge("emp-1", "emp-3", weight=2.0)
analyzer.add_edge("emp-4", "emp-5", weight=1.0)  # Isolated cluster

# Compute centrality for a node
centrality = analyzer.compute_centrality("emp-2")
# Returns: CentralityScores with:
# - degree_centrality: 0.75 (connected to 2/3 others)
# - betweenness_centrality: 0.5 (bridge position)
# - closeness_centrality: 0.8 (average distance)
# - eigenvector_centrality: 0.7 (influence)
# - influence_score: 0.69 (composite)

# Detect isolated nodes
isolated = analyzer.get_isolated_nodes(threshold=0.1)
# Returns: ["emp-4", "emp-5"]

# Calculate collaboration entropy
entropy = analyzer.calculate_collaboration_entropy("emp-2")
# Returns: 0.65 (distributed interactions; high = many collaborators)

# Estimate burnout propagation risk
propagation_risk = analyzer.estimate_burnout_propagation_risk(
    node_id="emp-2",
    node_risk_score=0.7,
    neighbor_risk_scores={"emp-1": 0.6, "emp-3": 0.4},
)
# Returns: 0.52 (risk of spreading burnout to neighbors)

# ============================================================================
# 5. BATCH PROCESSING SCHEDULER
# ============================================================================

"""
Schedule periodic batch jobs for model inference, anomaly detection, etc.

Location: backend/core/scheduler.py
"""

from backend.core.scheduler import get_scheduler, start_scheduler, stop_scheduler
from datetime import time

# Get global scheduler instance
scheduler = get_scheduler()

# Define a batch job
async def daily_inference_job():
    """Run burnout predictions for all employees daily at 2 AM."""
    print("Running daily burnout inference...")
    # Query all employees, compute interventions, store results
    pass

# Register the job
scheduler.register_job(
    job_id="daily-burnout-inference",
    func=daily_inference_job,
    interval_seconds=86400,  # 24 hours
    run_at_time=time(2, 0),  # 2 AM UTC
)

# Similarly register anomaly detection job
async def anomaly_detection_job():
    """Run anomaly detection every 6 hours."""
    print("Running anomaly detection...")
    pass

scheduler.register_job(
    job_id="anomaly-detection",
    func=anomaly_detection_job,
    interval_seconds=21600,  # 6 hours
)

# Start scheduler in app startup
@app.on_event("startup")
async def startup():
    await start_scheduler()

# Stop scheduler on shutdown
@app.on_event("shutdown")
async def shutdown():
    await stop_scheduler()

# ============================================================================
# 6. FRONTEND INTEGRATION
# ============================================================================

"""
React components for displaying interventions and anomalies.

Components:
- InterventionRecommendations: Display recommended interventions
- AnomalyIndicator: Show detected behavioral anomalies
"""

# Usage in React:
import InterventionRecommendations from '@/components/interventions/InterventionRecommendations';
import AnomalyIndicator from '@/components/anomalies/AnomalyIndicator';

// In a dashboard page:
<InterventionRecommendations
    employeeId="emp-123"
    employeeName="John Doe"
    recommendations={recommendations}
    overallUrgency="critical"
    reasoning="High performer showing signs of burnout..."
    onExecuteIntervention={async (type, notes) => {
        // Call /api/interventions/execute endpoint
    }}
/>

<AnomalyIndicator
    sentiment={{detected: true, severity: "high", z_score: 2.8, ...}}
    engagement={{detected: false, ...}}
    performance={{detected: true, severity: "medium", ...}}
    communication={{detected: true, severity: "high", ...}}
    composite={{detected: true, reason: "Multiple anomalies...", severity: "high"}}
/>

# ============================================================================
# 7. DATABASE INTEGRATION
# ============================================================================

"""
New database tables for storing interventions and anomalies.

Schema: backend/database/002_create_interventions_table.sql

Tables:
- interventions: Store recommended and executed interventions
- intervention_execution_log: Audit trail
- behavioral_anomalies: Store detected anomalies
"""

# Run migration (using Supabase or direct SQL):
-- psql -U user -d database -f backend/database/002_create_interventions_table.sql

# Example: Query interventions for an employee
SELECT * FROM interventions
WHERE employee_id = 'emp-123' AND status != 'declined'
ORDER BY urgency DESC, recommended_at DESC;

# Log an intervention execution
INSERT INTO interventions (
    employee_id, intervention_type, urgency, priority_score,
    description,status, executed_by, notes
) VALUES (
    'emp-123', 'one-on-one', 'critical', 0.92,
    'Immediate check-in...', 'completed', 'mgr-456',
    'Employee discussed workload concerns, agreed to task redistribution'
);

# ============================================================================
# 8. API ENDPOINT CHEAT SHEET
# ============================================================================

"""
Quick reference for all new intervention endpoints.
"""

# 1. Get intervention recommendations
POST /api/interventions/recommend
Content-Type: application/json
Authorization: Bearer <token>
{
    "employee_id": "emp-123",
    "burnout_score": 0.78,
    "sentiment_score": -0.4,
    "performance_band": "top",
    "tenure_months": 24,
    "retention_risk": "high",
    "weeks_at_high_risk": 3,
    "anomaly_detected": true,
    "anomaly_type": "sentiment_crash"
}

# 2. Analyze behavioral anomalies
POST /api/interventions/analyze-anomalies
?employee_id=emp-123
?sentiment_history=-0.8,-0.6,-0.2,0.2,0.3,0.4,0.5
?engagement_history=0.8,0.7,0.6,0.5,0.4,0.3,0.2
?performance_history=0.9,0.9,0.85,0.8,0.75,0.7,0.65
?message_counts=50,48,45,40,35,30,15

# 3. Get intervention history
GET /api/interventions/history/emp-123

# 4. Log intervention execution
POST /api/interventions/execute/emp-123
Content-Type: application/json
{
    "intervention_type": "one-on-one",
    "notes": "Discussed workload; agreed to redistribute tasks"
}

# ============================================================================
# 9. TESTING CHECKLIST
# ============================================================================

"""
Items to test before production deployment.
"""

✅ Python syntax validation (completed)
⏳ Import all modules in fastapi startup
⏳ Test intervention recommendation endpoint
⏳ Test anomaly detection endpoint
⏳ Verify ML classifier feature engineering
⏳ Test network centrality calculations
⏳ Run database schema migration
⏳ Test React components rendering
⏳ E2E workflow: risk data → interventions → execution logging
⏳ Load testing: batch scheduler with 1000+ employees
⏳ Edge cases: empty histories, null values, single data point

# ============================================================================
# 10. DEPLOYMENT NOTES
# ============================================================================

"""
Important considerations for production deployment.
"""

1. **ML Model Replacement**
   - Current: Mock RandomForestClassifier in memory
   - For production: Replace with sklearn RandomForestClassifier
   - Consider: Model versioning, retraining pipeline, performance monitoring

2. **Database Migration**
   - Run 002_create_interventions_table.sql on Supabase
   - Test indexes and query performance
   - Consider: backup strategy, rollback plan

3. **Batch Scheduler**
   - Currently: Simple in-memory scheduler
   - For production: Consider APScheduler with database persistence or Celery
   - Monitoring: Add metrics for job success/failure rates

4. **Performance Optimization**
   - Anomaly detection: Cache z-score calculations if computing frequently
   - Network analysis: Use networkx library for larger networks
   - ML inference: Consider batch prediction for all employees

5. **Monitoring & Alerts**
   - Track intervention effectiveness
   - Alert on high-urgency recommendations
   - Monitor scheduler job execution
   - Log all data access for compliance

# ============================================================================
