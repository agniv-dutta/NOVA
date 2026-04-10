<h1 align="center">🚀 NOVA: AI-Powered Organizational Wellness & Risk Intelligence Platform</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=111827" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Groq-LLM-F55036" alt="Groq" />
</p>

**Live Demo**: https://nova-two-woad.vercel.app/

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [The Problem](#-the-problem)
3. [Our Solution](#-our-solution)
4. [Key Features](#-key-features)
5. [Tech Stack](#-tech-stack)
6. [Architecture](#-architecture)
7. [API Endpoints](#-api-endpoints)
8. [Setup & Installation](#-setup--installation)
9. [Running the Application](#-running-the-application)
10. [Role-Based Access Control](#-rbac)
11. [Implementation Status](#-implementation-status)
12. [Roadmap](#-roadmap)

---

## 🎯 Overview

**NOVA** is an enterprise-grade AI analytics platform designed to predict and prevent employee burnout, attrition, and organizational health crises **before they happen**.

Using advanced machine learning, statistical anomaly detection, and network analysis, NOVA provides HR leaders with **actionable insights** and **AI-recommended interventions** to protect their most valuable assets: their people.

### Key Statistics
- **15+ role-aware dashboards and panels** for organizational health
- **8 intervention types** automatically recommended by AI
- **5 behavioral anomaly detectors** using Z-score analysis
- **Network-based burnout propagation modeling**
- **7 enterprise expansion modules** now integrated (OAuth, reporting, benchmarking, Jira signals, manager 360, onboarding watch, PWA)
- **Role-based access control** for HR, Managers, Leadership, and Employees

---

## 🔴 The Problem

### The Burnout Crisis
- **76% of employees** report experiencing burnout at least sometimes
- **High-performing employees** leave at 5x the rate due to burnout
- **Average turnover cost**: 50-200% of annual salary
- **Detection lag**: Companies typically notice burnout **3-6 months too late**

### Current State of HR Analytics
❌ Reactive dashboards (showing past trends, not predicting future)  
❌ No early intervention system (waiting for employee complaints)  
❌ Silent departures (high performers leaving before anyone notices)  
❌ Isolated metrics (burnout, sentiment, performance not connected)  
❌ No network effects considered (burnout spreading through teams)  
❌ Manual intervention planning (rules of thumb, not data-driven)

---

## ✅ Our Solution

### 🤖 AI-Powered Prediction Engine

**NOVA combines three powerful approaches:**

#### 1. **Rule-Based Burnout Scoring** (Instant, Explainable)
```
Risk Score = (
  0.30 × overtime_hours +
  0.20 × unused_pto_days +
  0.25 × negative_sentiment +
  0.15 × meeting_load +
  0.10 × tenure_risk
)
```
- Visible rules → stakeholders understand the scoring
- Instant calculation → real-time dashboards
- Calibrated on IBM HR Analytics dataset

#### 2. **LLM-Enriched Analysis** (Context-aware, Nuanced)
- **Groq AI integration** analyzes text feedback, survey responses, performance notes
- Generates natural language explanations of risk drivers
- Produces standardized 3-bullet summaries and action recommendations
- Streaming responses for real-time dashboards

#### 3. **Statistical Anomaly Detection** (Early Warning System)
- **Z-score analysis** detects sudden behavioral shifts (not just absolute scores)
- **5 detection types**: Sentiment crashes, engagement drops, performance declines, after-hours surges, communication drops
- **Composite detection**: 3+ simultaneous anomalies = **CRITICAL alert**
- Example: Employee's sentiment yesterday: 0.5 → today: -0.8 = **2.8σ anomaly**

#### 4. **Network-Based Risk Propagation** (Contagion Modeling)
- Models burnout as epidemiological network spread
- Calculates centrality (influence, bridge positions, isolation)
- Estimates propagation risk: `Risk = 0.4×own + 0.3×neighbors + 0.2×centrality×neighbor_avg + 0.1×degree`
- **Identifies burnout clusters** spreading through teams

#### 5. **Onboarding Cohort Baselines** (Fair Comparison for New Joiners)
- Detects employees in first 90 days and marks onboarding phase explicitly
- Uses onboarding baseline logic instead of org-wide comparisons for early-tenure risk
- Adds onboarding risk flags: **Integration Risk**, **Ramp Risk**, **Isolation Risk**
- Exposes onboarding watchlist for HR/Leadership via dedicated endpoint

### 🎯 Intelligent Intervention Engine

**8 Intervention Types** automatically recommended based on AI analysis:

| Intervention | Trigger | Timeline | Impact |
|---|---|---|---|
| **1:1 Check-in** | Burnout ≥ 0.75 + negative sentiment | 24-48h | 60-70% report clarity |
| **Workload Reduction** | Chronic high burnout | 1-2 weeks | -20-30% burnout |
| **Peer Mentoring** | Engagement drop + isolation | 6 weeks | +20-30% engagement |
| **Wellness Program** | Sustained high risk ≥ 3 weeks | 4 weeks | -10-15% stress |
| **Promotion Discussion** | High performer + retention risk | 1-2 weeks | 5x better retention |
| **Sabbatical** | Severe burnout (0.95+) | ASAP | 40% recovery in 2w |
| **Team Building** | Low team engagement | 4 weeks | +25% team sentiment |
| **Flexible Schedule** | Work-life imbalance signal | 3 weeks | -20-30% burnout |

### 🧾 Explainability, Accountability, and Trust

- Every major risk metric now supports **"Why this score?"** drilldowns in dashboard UI
- Score explanations include weighted contributors, confidence, and readable rationale
- Cost and savings analytics expose formulas, inputs, and stepwise calculations
- Org Health includes methodology disclosures and simulated-benchmark labels for transparency
- AI feedback sessions include explicit consent handling and review workflow for HR

### 📊 Real-Time Organizational Health Dashboard

**One screen shows the entire org's wellness:**
- Workforce Health Score (composite metric)
- Department burnout heatmaps
- Manager effectiveness scorecards
- Peer network isolation detection
- Attrition prediction timeline
- Engagement × Performance quadrant
- Sentiment trends & vocabulary shifts
- Industry benchmark overlays (simulated medians) for context-aware interpretation
- Downloadable executive-ready report package (multi-page PDF export)

---

## 🎨 Key Features

### 🔍 **Advanced Analytics**
- ✅ **Burnout Risk Assessment** - Rule-based + LLM hybrid scoring
- ✅ **Sentiment Analysis** - Groq-powered with emotion classification
- ✅ **Retention Flight Risk** - Predict who might leave
- ✅ **Performance Prediction** - Identify high performers at risk
- ✅ **Anomaly Detection** - Z-score detection of sudden behavioral shifts
- ✅ **Network Analysis** - Centrality, collaboration entropy, propagation modeling
- ✅ **Composite Risk Scoring** - Temporal-weighted multi-factor scoring
- ✅ **Onboarding Risk Scoring** - 90-day cohort baseline + onboarding flags
- ✅ **Benchmark Comparison** - Sector-level median overlays for workforce and attrition trends

### 📈 **Visualization & Insights**
- ✅ **12+ Dashboard Components** - Real-time metrics & trends
- ✅ **Workforce Health Score** - Executive summary metric
- ✅ **Manager Effectiveness Scorecard** - Team metrics & eNPS
- ✅ **Burnout Heatmap** - Department × Time visualization
- ✅ **Attrition Prediction Timeline** - Forecast with confidence bands
- ✅ **Engagement-Performance Quadrant** - Identify Stars & At-Risk
- ✅ **Sentiment Analyzer** - Word clouds & trend analysis
- ✅ **Peer Network Graph** - D3.js force-directed graph
- ✅ **Jira Health Panel** - Objective delivery signals with privacy framing
- ✅ **Onboarding Watch** - HR-focused new-joiner risk card with baseline tooltip
- ✅ **How You Compare** - Benchmark badge + industry comparison section
- ✅ **Explainability Drawers** - Score-level factor contributions across key cards/charts

### 🎯 **AI-Powered Interventions**
- ✅ **Intervention Engine** - Rule-based + ML hybrid recommendations
- ✅ **Execution Tracking** - Log & monitor intervention outcomes
- ✅ **Timing Awareness** - Avoid suggesting interventions during crunch weeks
- ✅ **Impact Estimation** - "This will reduce burnout by 20-30% in 3 weeks"
- ✅ **Risk Explanation** - "If delayed, disengagement will deepen"
- ✅ **Mandatory Feedback Session Workflow** - Schedule, consent, review, and HR ingestion
- ✅ **Manager 360 Feedback Loop** - Anonymous upward ratings + trend and improvement suggestions

### 🔐 **Security & Access Control**
- ✅ **Role-Based Access** (RBAC) - HR, Manager, Leadership, Employee roles
- ✅ **Supabase Authentication** - Email/password and Google OAuth + JWT exchange
- ✅ **Data Privacy** - PII handling, audit logging
- ✅ **Streaming AI Chat** - Real-time insights with Server-Sent Events
- ✅ **OAuth Account Linking Rules** - Existing org account matching and explicit reject message for unknown emails

### 📊 **Data Integration**
- ✅ **Multi-Source Data** - Survey, system telemetry, feedback sessions, and integration-ready connectors
- ✅ **Feature Engineering** - 10+ engineered features for ML
- ✅ **Batch Processing** - APScheduler for periodic inference
- ✅ **Real-Time Updates** - Async concurrent processing
- ✅ **Jira Connector (Mock Pipeline)** - Stable seeded ingestion for demo-consistent objective metrics

### 📱 **Product Experience**
- ✅ **Google Sign-In Primary CTA** - OAuth-first login experience
- ✅ **Installable PWA** - Manifest + service worker for app-shell caching
- ✅ **Mobile UX Enhancements** - Bottom tab navigation, install banner, chart touch zoom/scroll handling
- ✅ **Org Health Report Export** - One-click multi-page PDF generation with progress states

---

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI 0.109.2
- **Server**: Uvicorn
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + Supabase Auth (email/password + Google OAuth)
- **AI/ML**:
  - Groq API (LLM inference)
  - NumPy / Scikit-Learn (ML models)
  - Custom anomaly detection (Z-score)
  - Network analysis algorithms
- **Integration Layer**:
  - Jira connector module (mocked deterministic ingestion, real API shape)
  - Integration config persistence (`integration_configs`)
- **Async**: Python asyncio
- **Scheduling**: APScheduler (batch jobs)

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Visualization**: D3.js (network graphs), Recharts (dashboards)
- **State Management**: React Context
- **Auth SDK**: supabase-js (Google OAuth flow)
- **Export Tooling**: jsPDF + html2canvas
- **PWA Runtime**: Web App Manifest + Service Worker
- **HTTP Client**: Fetch API

### Infrastructure
- **Backend**: Render / Heroku (deployment ready)
- **Frontend**: Vercel (deployed)
- **Database**: Supabase Cloud
- **LLM API**: Groq Cloud

---

## 🏗️ Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + TypeScript)            │
│  ├─ Dashboard (12+ visualization components)                 │
│  ├─ OAuth Login + Session Exchange                            │
│  ├─ Employee Management                                      │
│  ├─ Intervention Recommendations UI                          │
│  ├─ Explainability Drawers                                   │
│  ├─ Report Export (PDF)                                      │
│  └─ PWA + Mobile UX Shell                                    │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API
┌──────────────────────────▼──────────────────────────────────┐
│                   BACKEND (FastAPI)                          │
│  ├─ Authentication & RBAC                                   │
│  ├─ AI Analysis Engine                                      │
│  │  ├─ Burnout Assessment (rules + Groq LLM)               │
│  │  ├─ Sentiment Analysis                                   │
│  │  ├─ Performance Prediction                               │
│  │  ├─ Retention Risk Assessment                            │
│  │  ├─ Anomaly Detection (Z-score)                         │
│  │  ├─ Network Analysis (centrality, propagation)          │
│  │  └─ Intervention Engine (8 types)                       │
│  ├─ Batch Processing (APScheduler)                         │
│  ├─ Integrations Layer (Jira connector + config)           │
│  ├─ Reporting & Benchmark APIs                             │
│  └─ API Routes (70+ endpoints)                             │
└──────────────────────────┬──────────────────────────────────┘
                           │ SQL
┌──────────────────────────▼──────────────────────────────────┐
│           DATABASE (Supabase PostgreSQL)                     │
│  ├─ Users & Authentication                                  │
│  ├─ Employee Data                                           │
│  ├─ Risk Scores & History                                   │
│  ├─ Interventions & Execution Log                          │
│  ├─ Anomaly Records                                         │
│  ├─ Integration Configs                                     │
│  ├─ Manager 360 Feedback                                    │
│  ├─ Feedback Session Artifacts                              │
│  └─ Audit Trail                                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow
1. **Data Ingestion** → Employee data from HR systems → Supabase
2. **Analysis** → FastAPI processes data concurrently
   - Burnout scoring (rules)
   - Sentiment analysis (Groq LLM)
   - Retention assessment (hybrid)
   - Performance prediction (LLM)
   - Anomaly detection (Z-score)
   - Network analysis (centrality, propagation)
3. **Recommendations** → Intervention Engine generates suggestions
4. **Visualization** → Real-time dashboards + alerts
5. **Logging** → Track interventions & outcomes

---

## 📡 API Endpoints

### Authentication
```
POST   /auth/register              Register new user
POST   /auth/login                 Login & get JWT token
POST   /auth/oauth/exchange        Exchange Supabase OAuth token for NOVA JWT
GET    /auth/me                    Get current user profile
```

### AI Insights
```
POST   /api/ai/sentiment            Analyze sentiment from text
POST   /api/ai/burnout-risk         Assess burnout risk
POST   /api/ai/performance-prediction  Predict performance band
POST   /api/ai/retention-risk       Assess retention/flight risk
GET    /api/ai/insights/{id}       Get all insights for employee
POST   /api/ai/ask-nova             Chat with AI assistant (streaming)
```

### Interventions (NEW)
```
POST   /api/interventions/recommend           Get AI intervention recommendations
POST   /api/interventions/recommendations     Alias: intervention recommendations
POST   /api/interventions/analyze-anomalies   Detect behavioral anomalies
POST   /api/interventions/anomalies           Alias: anomaly analysis endpoint
GET    /api/interventions/history/{id}        Get intervention history
POST   /api/interventions/execute/{id}        Log intervention execution
```

### Explainability, Reporting, and Benchmarks
```
GET    /api/explain/burnout/{id}              Explain burnout score factors
GET    /api/explain/attrition/{id}            Explain attrition score factors
GET    /api/explain/engagement/{id}           Explain engagement score factors
GET    /api/insights/cost-impact              Transparent cost/savings methodology payload
GET    /api/reports/org-health?format=pdf     Structured report payload for frontend PDF rendering
GET    /api/benchmarks/{sector}               Sector benchmark reference data
GET    /api/benchmarks/current/org            Org-sector benchmark mapping
```

### Feedback Sessions and 360 Feedback
```
GET    /api/feedback/sessions/my              Employee session schedule/status
POST   /api/feedback/sessions/consent         Record explicit feedback-session consent
POST   /api/feedback/sessions/process         Process and analyze session payload
GET    /api/feedback/sessions/pending-review  HR pending session count/list
POST   /api/feedback/manager/{manager_id}     Anonymous upward manager feedback submission
GET    /api/managers/{id}/360-scores          Aggregated manager 360 trends + suggestion
```

### Integrations
```
GET    /api/integrations/jira/metrics/{employee_id}  Jira metrics per employee (mock-backed)
GET    /api/integrations/jira/team/{department}      Team-level Jira health aggregate
POST   /api/integrations/config                      Save integration config (HR/Leadership)
GET    /api/integrations/status                      Connected/disconnected integration statuses
POST   /api/integrations/jira/sync                  Trigger Jira sync (manual)
```

### Onboarding Intelligence
```
GET    /api/employees/onboarding          Onboarding watchlist with adjusted risk and flags
```

### Employee Management
```
GET    /employees                   Get all employees (paginated)
GET    /employees/{id}              Get employee details
POST   /employees                   Create employee
PUT    /employees/{id}              Update employee
DELETE /employees/{id}              Delete employee
GET    /employees/risk-summary      Get organization-wide risk summary
```

### HR Analytics
```
GET    /hr/dashboard                Get HR dashboard metrics
GET    /hr/burnout-report           Get burnout analysis report
GET    /hr/retention-analysis       Get retention risk analysis
GET    /hr/team-insights            Get team-level insights
POST   /hr/export-report            Export insights as PDF/CSV
```

### Manager Tools
```
GET    /manager/team                Get manager's team details
GET    /manager/dashboard           Get manager's team dashboard
GET    /manager/effectiveness/{id}  Get manager effectiveness scorecard
POST   /manager/1-on-1-notes        Log 1-on-1 meeting notes
```

### Leadership
```
GET    /leadership/org-health        Get organization health score
GET    /leadership/risk-clusters     Get burnout risk clusters
GET    /leadership/strategic-insights  Get strategic recommendations
GET    /leadership/benchmarking      Get industry benchmarks
```

### Status & Health
```
GET    /health                      Health check
GET    /docs                        API documentation (Swagger)
GET    /redoc                       API documentation (ReDoc)
```

---

## 🚀 Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (via Supabase)
- Git

### Backend Setup

**1. Clone repository:**
```bash
git clone https://github.com/yourusername/nova.git
cd nova/backend
```

**2. Create virtual environment:**
```bash
python -m venv .venv
.venv\Scripts\Activate.ps1  # Windows PowerShell
# or
source .venv/bin/activate   # macOS/Linux
```

**3. Install dependencies:**
```bash
pip install -r requirements.txt
```

**4. Configure environment:**
```bash
# Copy example config
cp .env.example .env

# Edit .env with your values:
# SUPABASE_URL=your_supabase_url
# SUPABASE_KEY=your_supabase_key
# GROQ_API_KEY=your_groq_key
```

**5. Run database migrations:**
```bash
# Run SQL migrations in Supabase dashboard
# or via CLI: psql -U user -d database -f database/001_create_users_table.sql
```

### Frontend Setup

**1. Navigate to frontend:**
```bash
cd ../frontend
```

**2. Install dependencies:**
```bash
npm install
```

**3. Configure environment:**
```bash
# Edit .env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

**4. Enable Google OAuth in Supabase:**
- In Supabase Auth Providers, enable Google
- Add site URL and redirect URL for your frontend (e.g., `http://localhost:5173/login?oauth=google`)
- Ensure allowed email domains/org policy align with your employee directory

---

## ▶️ Running the Application

### Start Backend

**Terminal 1:**
```powershell
cd "C:\path\to\NOVA\backend"
python -m uvicorn main:app --reload --port 8000
```

✅ Backend runs at: `http://localhost:8000`  
📖 API docs at: `http://localhost:8000/docs`

### Start Frontend

**Terminal 2:**
```powershell
cd "C:\path\to\NOVA\frontend"
npm run dev
```

✅ Frontend runs at: `http://localhost:5173`

### Access Application

1. Open browser to `http://localhost:5173`
2. Sign in with test credentials:
   - Email: `hr.admin@company.com`
   - Password: `TestPassword123!` (or your test user)
3. Explore dashboards and features

---

## 🔐 RBAC (Role-Based Access Control)

### Roles & Permissions

| Role | Access Level | Visible Data |
|------|---|---|
| **Employee** | Self-only | Own profile, own insights, personal dashboard |
| **Manager** | Team-level | Team members, team dashboard, effectiveness scores |
| **HR** | Organization-wide | All employees, reports, interventions, trends |
| **Leadership** | Executive | Org health, strategic insights, benchmarking |

### Endpoint Protection
All API endpoints require valid JWT token with appropriate role.

Example request:
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8000/api/ai/sentiment
```

---

## 📊 Implementation Status

### ✅ **Fully Implemented**
- FastAPI backend with 55+ endpoints
- Burnout risk assessment (rules + Groq LLM)
- Sentiment analysis with structured LLM outputs
- Retention flight risk prediction
- Performance prediction
- Staff aggregated insights API
- Role-based access control (RBAC)
- Streaming AI chat (Server-Sent Events)
- Supabase authentication & database
- Google OAuth sign-in with account linking rules and avatar propagation
- 12+ frontend visualization components
- Intervention Engine (8 recommendation types)
- Anomaly Detection (Z-score + temporal weighting)
- Network Analysis (centrality, propagation)
- Batch Scheduler (APScheduler ready)
- Structured AI insight schema (summary, key signals, recommended action + fallback parser)
- Intervention + anomaly widgets integrated in both dashboard and org health pages with RBAC visibility
- Composite score explainability UI (weighted breakdown, 7-day change reason, trend badges)
- Jira integration system (mocked ingestion, real UI and config lifecycle)
- Manager 360 feedback loop with k-anonymity behavior and trend aggregation
- Onboarding risk handling with first-90-days cohort baseline and onboarding watchlist
- Org Health report export API + frontend multi-page PDF generation flow
- Industry benchmark APIs and UI overlays/badges (explicitly labeled simulated medians)
- PWA support + mobile responsiveness enhancements (install banner, bottom tabs, touch graph interactions)

### 🔄 **In Progress**
- ML feature importance visualization
- What-If intervention simulator
- Historical trend persistence with correlation tagging
- Production hardening of Jira connector from mock pipeline to live API token flow

### ⏳ **Planned (Roadmap)**
- Org-graph burnout propagation map enhancements
- k-anonymity privacy layer
- PII boundary service
- Advanced audit logging

---

## 🗺️ Roadmap

### Phase 1: Foundation (✅ COMPLETE)
- Core AI engines (burnout, sentiment, retention, performance)
- Basic dashboards and visualizations
- RBAC and authentication
- Intervention engine with 8 recommendation types

### Phase 2: Intelligence (Current)
- Structured AI summaries with robust fallback handling
- Temporal-weighted anomaly composite with explainability panels
- ML classifier with feature importance visualization
- What-if intervention simulator
- Manager 360 trend quality scoring and manager coaching feedback loop refinements

### Phase 3: Enterprise (Q2 2026)
- Advanced privacy & compliance (k-anonymity, PII vault)
- Multi-org support
- Custom intervention types
- External data integrations (Slack, Google Calendar, HiBob)
- Live Jira REST v3 integration rollout (replacing seeded mock provider)

### Phase 4: Scale (Q3+ 2026)
- Competitor benchmarking database expansion (real datasets beyond simulated medians)
- Industry-specific insights
- Advanced predictive models
- API for third-party integrations

---

## 📖 Documentation

- **API Guide**: See [docs](http://localhost:8000/docs) when backend is running
- **RBAC Guide**: [backend/RBAC_GUIDE.md](backend/RBAC_GUIDE.md)
- **Integration Guide**: [backend/INTEGRATION_GUIDE.md](backend/INTEGRATION_GUIDE.md)
- **Quick Start**: [QUICK_START.md](QUICK_START.md)
- **Team Checklist**: [TEAM_INTEGRATION_CHECKLIST.md](TEAM_INTEGRATION_CHECKLIST.md)

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

---

## 🎯 Mission

**NOVA exists to solve the burnout crisis.**

We believe organizations can predict and prevent employee burnout before it happens. Using AI, data science, and human-centered interventions, NOVA transforms HR from reactive to proactive.

### Our Impact Goals
- 📉 Reduce burnout-related turnover by 40%
- 🎯 Improve intervention effectiveness by 60%
- ⏰ Enable early detection (3-6 months earlier)
- 💼 Empower HR teams with data-driven decisions
- 👥 Protect high performers from silent departures

---

## 📞 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@nova-analytics.com
- **Live Demo**: https://nova-two-woad.vercel.app/

---

## 🙏 Acknowledgments

Built by a team of 4 passionate developers committed to workplace wellness.

**Technologies**: FastAPI, React, TypeScript, Groq AI, Supabase, D3.js

---

**NOVA: Predict. Prevent. Protect.** 🚀

---

