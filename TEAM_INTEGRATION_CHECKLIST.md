# NOVA Implementation - Team Integration Checklist

**Date Started**: April 3, 2026  
**Target Completion**: April 10-12, 2026  
**Team Size**: 4 people

---

## Team Assignment

- **Person 1**: Backend Integration & Testing
- **Person 2**: Frontend Component Integration
- **Person 3**: Database & API Testing
- **Person 4**: QA & E2E Testing

---

## PHASE 1: Foundation Setup (2-3 hours)

### Database Migration
- [ ] P1: Review `backend/database/002_create_interventions_table.sql`
- [ ] P1: Run migration on Supabase (or local Postgres)
- [ ] P3: Verify tables created with `\d interventions`
- [ ] P3: Check indexes are created
- [ ] P1: Test insert a sample intervention manually

### Backend Integration
- [ ] P1: Verify `backend/main.py` has intervention router import
- [ ] P1: Start FastAPI server and check `/docs` for new endpoints
- [ ] P1: Confirm no import errors in startup logs
- [ ] P1: Test health check or any existing endpoint still works

### Frontend Setup
- [ ] P2: Verify `InterventionRecommendations.tsx` compiles (check for TS errors)
- [ ] P2: Verify `AnomalyIndicator.tsx` compiles
- [ ] P2: Create stub exports in component index files if needed

---

## PHASE 2: API Endpoint Testing (3-4 hours)

### Intervention Recommendations Endpoint
- [ ] P3: Get API running
- [ ] P3: Test with Postman/curl:
  ```json
  POST /api/interventions/recommend
  {
    "employee_id": "test-emp-1",
    "burnout_score": 0.78,
    "sentiment_score": -0.4,
    "performance_band": "top",
    "tenure_months": 24,
    "retention_risk": "high",
    "weeks_at_high_risk": 3,
    "anomaly_detected": true,
    "anomaly_type": "sentiment_crash"
  }
  ```
- [ ] P3: Verify response has recommendations array
- [ ] P3: Verify urgency levels are set correctly
- [ ] P3: Check LLM reasoning is populated

### Anomaly Analysis Endpoint
- [ ] P3: Test with Postman/curl:
  ```url
  POST /api/interventions/analyze-anomalies?
    employee_id=test-emp-1&
    sentiment_history=-0.8,-0.6,-0.2,0.2,0.3,0.4,0.5&
    engagement_history=0.8,0.7,0.6,0.5,0.4,0.3,0.2&
    performance_history=0.9,0.85,0.8,0.75,0.7,0.65,0.6&
    message_counts=50,48,45,40,35,30,15
  ```
- [ ] P3: Verify individual anomaly results
- [ ] P3: Verify composite anomaly detection
- [ ] P3: Check z-scores are calculated

### History & Execution Endpoints
- [ ] P3: Test GET `/api/interventions/history/test-emp-1`
- [ ] P3: Verify returns empty array initially (not yet persisted)
- [ ] P3: Test POST `/api/interventions/execute/test-emp-1`
- [ ] P3: Verify returns logged status (stub for now)

### Error Handling
- [ ] P3: Test with missing required fields (should 422 error)
- [ ] P3: Test with invalid role (should 403 error)
- [ ] P3: Test with malformed JSON (should 400 error)

---

## PHASE 3: Frontend Component Integration (3-4 hours)

### InterventionRecommendations Component
- [ ] P2: Import component in a test page
- [ ] P2: Pass mock recommendation data
- [ ] P2: Verify component renders without errors
- [ ] P2: Test expand/collapse functionality
- [ ] P2: Test execution button functionality (mock callback)
- [ ] P2: Check responsive layout on mobile
- [ ] P2: Verify urgency color coding:
  - [ ] Low = blue
  - [ ] Medium = yellow
  - [ ] High = orange
  - [ ] Critical = red

### AnomalyIndicator Component
- [ ] P2: Import component in a test page
- [ ] P2: Test with all anomalies detected
- [ ] P2: Test with no anomalies
- [ ] P2: Test with partial anomalies (some detected, some not)
- [ ] P2: Verify severity badges render correctly
- [ ] P2: Check compact vs full view modes
- [ ] P2: Verify icons display correctly

### Integration with Employee Detail Page
- [ ] P2: Add InterventionRecommendations to employee detail modal
- [ ] P2: Fetch recommendations from API when modal opens
- [ ] P2: Handle loading state while fetching
- [ ] P2: Handle error state if API fails
- [ ] P2: Show "No recommendations" if response is empty

### Integration with Dashboard
- [ ] P2: Add AnomalyIndicator to employee list cards (compact view)
- [ ] P2: Color-code critical anomalies prominently
- [ ] P2: Add click handler to expand for details
- [ ] P2: Test with mock anomaly data

---

## PHASE 4: User Workflow Testing (2-3 hours)

### End-to-End Workflow
- [ ] P4: Create test employee data in Supabase
- [ ] P4: Navigate to employee detail page
- [ ] P4: Verify anomaly indicator shows on dashboard
- [ ] P4: Click employee to open detail panel
- [ ] P4: Verify intervention recommendations load
- [ ] P4: Expand first recommendation
- [ ] P4: Click "Mark as Executed"
- [ ] P4: Enter notes and confirm
- [ ] P4: Verify execution is logged (check if persisted to DB)

### High-Risk Scenario
- [ ] P4: Test with burnout_score = 0.95, sentiment = -0.9
- [ ] P4: Verify urgency is "critical"
- [ ] P4: Verify timing window is "24-48 hours"
- [ ] P4: Verify top recommendation is "one-on-one"

### Low-Risk Scenario
- [ ] P4: Test with burnout_score = 0.1, sentiment = 0.5
- [ ] P4: Verify urgency is "low"
- [ ] P4: Verify no recommendations or minimal recommendations

### Edge Cases
- [ ] P4: Test with empty anomaly history
- [ ] P4: Test with single data point
- [ ] P4: Test with NaN/null values
- [ ] P4: Test with negative/out-of-range scores

---

## PHASE 5: Database Integration (2-3 hours)

### Execution Logging
- [ ] P1: Implement intervention execution insertion in DB
- [ ] P1: Test that `POST /api/interventions/execute` inserts to DB
- [ ] P1: Verify intervention status is updated to "completed"
- [ ] P1: Verify `executed_by` user is recorded
- [ ] P1: Verify notes are saved

### History Retrieval
- [ ] P1: Implement `GET /api/interventions/history/{id}` to query DB
- [ ] P1: Test that history returns interventions for an employee
- [ ] P1: Verify sorting by date (newest first)
- [ ] P1: Test filtering by status (if supported)

### Anomaly Storage
- [ ] P1: Insert detected anomalies into `behavioral_anomalies` table
- [ ] P1: Test query anomalies for an employee
- [ ] P1: Verify severity is recorded
- [ ] P1: Verify detection timestamp is accurate

### Audit Logging
- [ ] P1: Insert entries into `intervention_execution_log`
- [ ] P1: Verify actor_id is recorded
- [ ] P1: Test audit trail for an intervention

---

## PHASE 6: Performance & Optimization (1-2 hours)

### Load Testing
- [ ] P1: Test recommendation endpoint with 1000+ concurrent requests
- [ ] P1: Check response time < 1 second
- [ ] P1: Verify no timeouts or 500 errors
- [ ] P3: Monitor database query performance
- [ ] P3: Check index usage (EXPLAIN ANALYZE)

### Caching (Optional)
- [ ] P1: Consider caching burnout scores (5-15 min TTL)
- [ ] P1: Cache centrality calculations for team graphs
- [ ] P3: Measure impact on response times

---

## PHASE 7: Documentation & Handoff (1-2 hours)

### Code Documentation
- [ ] P1: Add docstrings to intervention_engine functions
- [ ] P1: Add docstrings to anomaly_detector functions
- [ ] P1: Document ML feature engineering logic

### API Documentation
- [ ] P3: Update API docs with intervention endpoints
- [ ] P3: Add request/response examples
- [ ] P3: Document error codes and messages

### User Guide
- [ ] P2: Create UI guide for managers using intervention recommendations
- [ ] P2: Screenshot walkthrough of workflow
- [ ] P2: FAQ: "What does urgency mean?" "How reliable are anomalies?"

### Deployment Guide
- [ ] P1: Create deployment checklist
- [ ] P1: Document environment variables needed
- [ ] P1: Create rollback plan if issues found

---

## PHASE 8: Bug Fixes & Polish (Ongoing)

### Critical Bugs
- [ ] [ ] Fix any import errors
- [ ] [ ] Fix any missing CORS headers
- [ ] [ ] Fix any database connection issues
- [ ] [ ] Fix any component rendering errors

### Medium Priority
- [ ] [ ] Improve error messages
- [ ] [ ] Add loading spinners
- [ ] [ ] Add toast notifications for success/error
- [ ] [ ] Improve mobile responsiveness

### Nice-to-Haves
- [ ] [ ] Add dark mode support
- [ ] [ ] Add export functionality
- [ ] [ ] Add filtering/sorting options
- [ ] [ ] Add analytics/tracking

---

## Burndown Checklist

Track progress with estimates and actuals:

| Phase | Tasks | Estimate | Actual | Status |
|-------|-------|----------|--------|--------|
| 1. Setup | 5 | 2-3h | - | ⏳ |
| 2. API Testing | 14 | 3-4h | - | ⏳ |
| 3. Frontend | 17 | 3-4h | - | ⏳ |
| 4. E2E Workflow | 8 | 2-3h | - | ⏳ |
| 5. Database | 9 | 2-3h | - | ⏳ |
| 6. Performance | 8 | 1-2h | - | ⏳ |
| 7. Documentation | 9 | 1-2h | - | ⏳ |
| 8. Polish | 15 | TBD | - | ⏳ |

**Total Estimate**: 15-24 hours of work  
**Target Completion**: 2-3 days (with full team)

---

## Sign-Off

When all checks are complete, have:
- [ ] **Person 1** verify backend is production-ready
- [ ] **Person 2** verify frontend is production-ready  
- [ ] **Person 3** verify APIs are working correctly
- [ ] **Person 4** sign off on QA testing

---

## Notes & Issues

Use this space to track blockers, issues, or notes:

```
[Date] Issue: [Description]
[Date] Resolution: [What was done]
```

---

Generated: April 3, 2026  
Ready to use! 🚀
