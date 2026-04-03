# NOVA Implementation Analysis & Gap Report

## 📊 Current Implementation Status

### ✅ **IMPLEMENTED (Strong Foundation)**

#### Backend (FastAPI)
| Feature | Status | Location | Notes |
|---------|--------|----------|-------|
| FastAPI Backend | ✅ Complete | `backend/main.py` | Single-language backend (Python only) |
| Burnout Risk Assessment | ✅ Complete | `backend/ai/burnout.py` | Rule-based scoring + Groq LLM insights |
| Sentiment Analysis | ✅ Complete | `backend/ai/sentiment.py` | Groq-powered sentiment analysis |
| Retention/Flight Risk | ✅ Complete | `backend/ai/retention.py` | Rule-based + LLM hybrid approach |
| Performance Prediction | ✅ Complete | `backend/ai/performance.py` | Groq LLM-based |
| Aggregated Insights API | ✅ Complete | `backend/ai/insights.py` | Concurrent async execution |
| Role-Based Access (RBAC) | ✅ Complete | `backend/api/deps.py`, `RBAC_GUIDE.md` | HR, Manager, Leadership, Employee roles |
| Streaming AI Chat | ✅ Complete | `backend/api/routes/ai.py` | Server-Sent Events streaming |
| Supabase Integration | ✅ Complete | `backend/core/database.py` | Auth & database |

#### Frontend (React + TypeScript)
| Feature | Status | Location | Notes |
|---------|--------|----------|-------|
| Dashboard with Metrics | ✅ Complete | `frontend/src/pages/DashboardPage.tsx` | 12+ visualization components |
| Workforce Health Score | ✅ Complete | `WorkforceHealthScore.tsx` | Composite score display |
| Manager Effectiveness Scorecard | ✅ Complete | `ManagerEffectivenessScorecard.tsx` | Team metrics, trends, eNPS |
| Peer Network Graph | ✅ Complete | `PeerNetworkGraph.tsx` | D3.js force-directed graph with isolation detection |
| Burnout Heatmap | ✅ Complete | `BurnoutHeatmap.tsx` | Department x Time visualization |
| Attrition Prediction Timeline | ✅ Complete | `AttritionPredictionTimeline.tsx` | Forecast with confidence bands |
| Engagement-Performance Quadrant | ✅ Complete | `EngagementPerformanceQuadrant.tsx` | Stars/At-Risk segmentation |
| Org Health Report | ✅ Complete | `OrgHealthPage.tsx` | Executive summary, export, interventions |
| Sentiment Analyzer | ✅ Complete | `SentimentPage.tsx` | Word cloud + analyzer |
| Risk Calculation Utils | ✅ Complete | `riskCalculation.ts` | Burnout & attrition scoring logic |

---

### ⚠️ **PARTIALLY IMPLEMENTED (Needs Enhancement)**

| Feature | Current State | Gap | Priority |
|---------|--------------|-----|----------|
| **Composite Risk Score** | Rule-based in backend | Missing temporal weighting, not explainable in UI | 🔴 High |
| **Sentiment Pipeline** | Groq LLM only | No emotion classification (stress/frustration), no rolling window delta | 🔴 High |
| **GenAI Summaries** | Basic prompt | Need structured input→output format (3 bullets, 1 action) | 🟡 Medium |
| **Feature Importance** | Not implemented | Random Forest exists but no SHAP/feature importance viz | 🟡 Medium |
| **Network Graph** | Basic connectivity | Missing centrality score, collaboration entropy, influence propagation | 🔴 High |
| **Anomaly Detection** | Not implemented | Need Z-score/Isolation Forest for sudden behavioral shifts | 🔴 High |
| **Intervention Engine** | Static suggestions | Need rule-based + ML hybrid with timing awareness | 🔴 High |
| **Historical Trends** | Frontend mock only | No backend persistence, no correlation tagging | 🟡 Medium |

---

### ❌ **NOT IMPLEMENTED (Critical Gaps)**

#### 🔥 Killer Features (Pick ONE to Go All-In)

| Feature | Description | Implementation Effort | Impact |
|---------|-------------|----------------------|--------|
| **Org-Graph Burnout Propagation Map** | Force-directed graph showing risk clusters spreading through connections | 3-4 days | 🔥 Maximum |
| **What-If Intervention Simulator** | Slider-based: "If we reduce meeting load by 30%, risk drops from 78→41" | 2-3 days | 🔥 High |
| **Competitor Benchmarking** | Industry median comparison (simulated) | 1-2 days | 🟡 Medium |

#### 📊 Core ML Features Missing

| Feature | Description | Location Needed | Effort |
|---------|-------------|-----------------|--------|
| **Real ML Classifier** | Currently LLM-based, need actual Random Forest/XGBoost | `backend/ai/ml/` | 2-3 days |
| **Feature Store** | Engineered features table (sentiment_trend, meeting_load) | `backend/database/` | 1 day |
| **Communication Graph Analysis** | Centrality, response latency trends, collaboration entropy | `backend/ai/graph/` | 2-3 days |
| **Batch Processing Pipeline** | APScheduler jobs for periodic model inference | `backend/core/scheduler.py` | 1-2 days |

#### 🔐 Privacy & Architecture Missing

| Feature | Description | Effort |
|---------|-------------|--------|
| **k-anonymity implementation** | Team-level aggregation before individual unlock | 2 days |
| **PII Boundary Service** | Separate vault for raw data vs derived scores | 1-2 days |
| **Audit Logging** | Log every data access with reason | 1 day |
| **Employee Personal Dashboard** | "What data we hold about you" view | 1 day |

#### 📈 Data Strategy Gaps

| Feature | Description | Effort |
|---------|-------------|--------|
| **Synthetic Data Generator** | Realistic employee timelines for demo | 1-2 days |
| **Cold Start Mode** | 30-day baseline vs predictive mode | 1 day |
| **Feature Engineering** | Meeting load ratio, after-hours score, vocabulary shift | 2 days |

---

## 🎯 **15-Day Implementation Roadmap**

### Days 1-7: Must-Have Core Features

#### Day 1-2: ML Foundation
- [ ] Create `backend/ai/ml/burnout_classifier.py` with actual Random Forest
- [ ] Train on IBM HR Analytics dataset
- [ ] Add feature importance extraction
- [ ] Create `backend/database/feature_store.sql` schema

#### Day 3-4: Enhanced Scoring Engine
- [ ] Implement temporal-weighted composite score:
```python
risk_score = (
    0.35 * sentiment_trend +  # 7-day vs 30-day delta
    0.25 * workload_index +
    0.20 * behavioral_change +
    0.20 * engagement_score
)
```
- [ ] Add explainability API endpoint
- [ ] Frontend: Display score breakdown component

#### Day 5-6: Sentiment Pipeline Upgrade
- [ ] Add emotion classification (stress, frustration, disengagement)
- [ ] Implement rolling window analysis (7-day vs 30-day delta)
- [ ] Surface "vocabulary shift index" metric

#### Day 7: GenAI Summary Structure
- [ ] Upgrade prompts with strict input/output format
- [ ] Input: team scores, top 3 factors, anomalies
- [ ] Output: 3 bullet insights, 1 risk explanation, 1 action

### Days 7-12: Advanced Differentiators

#### Day 8-9: Communication Graph Analysis
- [ ] Calculate centrality scores (detect isolation)
- [ ] Implement collaboration entropy metric
- [ ] Add response latency trend analysis
- [ ] Frontend: Enhance PeerNetworkGraph with these metrics

#### Day 10: Intervention Engine
- [ ] Implement rule-based + ML hybrid system:
```python
IF risk_score ↑ for 3 weeks AND sentiment ↓:
    → trigger 1:1 recommendation
    → check calendar for intervention window
```
- [ ] Add intervention timing awareness (avoid crunch weeks)

#### Day 11: Anomaly Detection
- [ ] Implement Z-score / Isolation Forest for sudden shifts
- [ ] Create "behavioral shift" alert system
- [ ] Frontend: Add anomaly indicators to dashboard

#### Day 12: Historical Trends with Causality
- [ ] Backend: Store annotatable events
- [ ] Implement correlation tagging
- [ ] Frontend: Show "Policy X correlates with 22% drop"

### Days 12-15: Killer Feature Sprint

#### Day 13-14: Org-Graph Burnout Propagation Map (RECOMMENDED)
- [ ] Model burnout as epidemiological network
- [ ] Calculate propagation risk based on:
  - Node centrality (influence)
  - Edge weight (interaction frequency)
  - Current risk score
- [ ] Visualize with:
  - Node size → risk score
  - Edge thickness → interaction frequency
  - Color → sentiment trend (green/yellow/red)
- [ ] Add "burnout propagation risk clusters" view

#### Day 15: Polish & Demo Prep
- [ ] Synthetic data generator for compelling demo
- [ ] Cold start mode implementation
- [ ] Final testing and bug fixes

---

## 📁 Files to Create

```
backend/
├── ai/
│   ├── ml/
│   │   ├── __init__.py
│   │   ├── burnout_classifier.py      # Random Forest model
│   │   ├── anomaly_detector.py        # Isolation Forest
│   │   └── feature_engineer.py        # Feature extraction
│   ├── graph/
│   │   ├── __init__.py
│   │   ├── centrality.py              # Network centrality
│   │   ├── propagation.py             # Burnout contagion model
│   │   └── collaboration.py           # Entropy calculation
│   └── intervention_engine.py         # Rule + ML hybrid
├── core/
│   └── scheduler.py                   # APScheduler batch jobs
├── database/
│   ├── feature_store.sql
│   └── events_table.sql
└── api/routes/
    ├── graph.py                       # Network analysis endpoints
    └── intervention.py                # Intervention recommendations

frontend/
└── src/
    ├── components/
    │   ├── dashboard/
    │   │   ├── BurnoutPropagationMap.tsx    # KILLER FEATURE
    │   │   ├── WhatIfSimulator.tsx
    │   │   └── ScoreExplainability.tsx
    │   └── employees/
    │       └── AnomalyIndicator.tsx
    └── utils/
        └── propagationModel.ts
```

---

## 🏆 Pitch Points to Emphasize

1. **"Burnout is contagious in teams. We visualize how it spreads."**
2. **"We detect not just disengagement, but social isolation inside teams."**
3. **"We prioritize sudden behavioral shifts over absolute scores."**
4. **"We operate in two modes: Baseline (30 days) and Predictive."**
5. **"PII boundary service + audit logs for every access."**

---

## ⚡ Quick Wins (< 1 hour each)

1. Add feature importance visualization to existing dashboard
2. Upgrade prompts to structured format
3. Add "behavioral shift" badge to employee cards
4. Create synthetic data seeder script
5. Add export functionality to all charts (already partial)
