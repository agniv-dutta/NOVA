# 🔐 NOVA API - Role-Based Access Control (RBAC) Guide

## Overview

The NOVA API implements a comprehensive **JWT-based Role-Based Access Control (RBAC)** system that restricts endpoint access based on user roles.

---

## 🎭 User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| **Employee** | Standard user | Basic employee endpoints only |
| **Manager** | Team manager | Team management + employee endpoints |
| **HR** | Human Resources | Organization-wide HR data + employee endpoints |
| **Leadership** | Executive leadership | Strategic insights + employee endpoints |

---

## 🔑 Authentication Flow

### 1. **Login** (Get JWT Token)
```bash
POST /auth/login
Content-Type: application/x-www-form-urlencoded

username=employee@company.com&password=secret
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 2. **Use Token** (Access Protected Endpoints)
```bash
GET /employee/dashboard
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. **Logout** (Client-side Token Deletion)
```bash
POST /auth/logout
Authorization: Bearer <token>
```

---

## 📋 Test Credentials

| Email | Password | Role | Purpose |
|----------|----------|------|---------|
| `employee@company.com` | `secret` | Employee | Standard employee access |
| `manager@company.com` | `secret` | Manager | Team management testing |
| `hr.admin@company.com` | `secret` | HR | HR operations testing |
| `ceo@company.com` | `secret` | Leadership | Executive access testing |

---

## 🛣️ API Endpoints & Access Control

### **Authentication Endpoints** (`/auth`)

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/auth/login` | POST | 🌐 Public | Login with email/password |
| `/auth/register` | POST | 🌐 Public | Register new user account |
| `/auth/me` | GET | 🔒 Authenticated | Get current user info |
| `/auth/logout` | POST | 🔒 Authenticated | Logout (token invalidation) |

---

### **HR Endpoints** (`/hr`) - 👔 HR Role Only

| Endpoint | Access | Description |
|----------|--------|-------------|
| `/hr/org-risk-distribution` | HR | Organization-wide risk analytics |
| `/hr/compliance-reports` | HR | Compliance & regulatory reports |
| `/hr/workforce-planning` | HR | Headcount & workforce planning |

**RBAC Implementation:**
```python
@router.get("/org-risk-distribution")
async def get_org_risk_distribution(current_user: User = Depends(require_hr)):
    # Only HR role can access
    ...
```

---

### **Manager Endpoints** (`/manager`) - 👨‍💼 Manager Role Only

| Endpoint | Access | Description |
|----------|--------|-------------|
| `/manager/team-alerts` | Manager | Team-level risk alerts |
| `/manager/team-performance` | Manager+ | Team performance metrics |
| `/manager/one-on-one-insights` | Manager | 1-on-1 meeting suggestions |

**RBAC Implementation:**
```python
@router.get("/team-alerts")
async def get_team_alerts(current_user: User = Depends(require_manager)):
    # Only Manager role can access
    ...

# Some endpoints allow multiple roles:
@router.get("/team-performance")
async def get_team_performance(
    current_user: User = Depends(require_manager_or_above)
):
    # Manager, HR, and Leadership can access
    ...
```

---

### **Leadership Endpoints** (`/leadership`) - 🏢 Leadership Role Only

| Endpoint | Access | Description |
|----------|--------|-------------|
| `/leadership/roi-forecast` | Leadership | ROI & financial forecasting |
| `/leadership/attrition-forecast` | Leadership | Employee attrition predictions |
| `/leadership/strategic-insights` | Leadership | Strategic business insights |

**RBAC Implementation:**
```python
@router.get("/roi-forecast")
async def get_roi_forecast(current_user: User = Depends(require_leadership)):
    # Only Leadership role can access
    ...
```

---

### **Employee Endpoints** (`/employee`) - 👤 All Authenticated Users

| Endpoint | Access | Description |
|----------|--------|-------------|
| `/employee/dashboard` | Any Auth | Personal dashboard |
| `/employee/goals` | Any Auth | Personal goals & OKRs |
| `/employee/feedback` | Any Auth | Feedback & reviews |

**RBAC Implementation:**
```python
@router.get("/dashboard")
async def get_employee_dashboard(
    current_user: User = Depends(get_current_active_user)
):
    # Any authenticated user can access
    ...
```

---

## 🔒 RBAC Implementation Details

### **Core Dependency: `require_role()`**

Located in `backend/api/deps.py`:

```python
def require_role(allowed_roles: List[UserRole]):
    """
    Dependency factory to require specific roles for route access.
    
    This is the core RBAC implementation.
    """
    async def role_checker(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role not in allowed_roles:
            logger.warning(f"🚫 [RBAC] Access denied for {current_user.email}")
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Required roles: {allowed_roles}"
            )
        logger.info(f"✅ [RBAC] Access granted for {current_user.email}")
        return current_user
    
    return role_checker
```

### **Pre-defined Role Dependencies**

```python
# Single role access
require_hr = require_role([UserRole.HR])
require_manager = require_role([UserRole.MANAGER])
require_leadership = require_role([UserRole.LEADERSHIP])

# Multiple role access
require_manager_or_above = require_role([
    UserRole.MANAGER,
    UserRole.HR,
    UserRole.LEADERSHIP
])

require_any_authenticated = get_current_active_user
```

---

## 🧪 Testing RBAC

### **Option 1: Interactive API Docs**

1. Visit: **http://localhost:8000/docs**
2. Click **"Authorize"** button (top right)
3. Login with test credentials (e.g., `hr.admin@company.com` / `secret`)
4. Try accessing different endpoints
5. See success/failure based on role

### **Option 2: Automated Test Script**

Run the comprehensive RBAC test suite:

```bash
cd backend
python test_rbac.py
```

This will:
- ✅ Test login for all 4 roles
- ✅ Verify HR can access HR endpoints (others can't)
- ✅ Verify Manager can access Manager endpoints (others can't)
- ✅ Verify Leadership can access Leadership endpoints (others can't)
- ✅ Verify all roles can access Employee endpoints
- ✅ Show colored output with pass/fail results

### **Option 3: Manual cURL Testing**

```bash
# 1. Login as HR
curl -X POST "http://localhost:8000/auth/login" \
  -d "username=hr.admin@company.com&password=secret"

# Response: { "access_token": "eyJhbG..." }

# 2. Access HR endpoint (✅ Should succeed)
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/hr/org-risk-distribution"

# 3. Try Manager endpoint (❌ Should fail with 403)
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/manager/team-alerts"
```

---

## 📊 Logging & Monitoring

The API includes comprehensive logging for RBAC actions:

### **Login Logs**
```
2026-03-28 23:01:50 - INFO - 🔐 Login attempt for email=hr.admin@company.com
2026-03-28 23:01:50 - INFO - ✅ Login success email=hr.admin@company.com role=hr
```

### **Access Grant Logs**
```
2026-03-28 23:02:15 - INFO - ✅ [RBAC] Access granted - User: hr.admin@company.com (Role: hr)
2026-03-28 23:02:15 - INFO - 🔒 [RBAC-HR] Org risk distribution accessed by: hr.admin@company.com
```

### **Access Denial Logs**
```
2026-03-28 23:02:30 - WARNING - 🚫 [RBAC] Access denied - User: employee@company.com (Role: employee) 
                                 tried to access route requiring: ['hr']
```

---

## 🔐 Security Features

### **1. JWT Token-Based Authentication**
- ✅ Stateless authentication
- ✅ Configurable expiration (default: 30 minutes)
- ✅ HS256 encryption algorithm
- ✅ Token includes user role for RBAC

### **2. Password Security**
- ✅ Passwords hashed with **bcrypt**
- ✅ Never stored or transmitted in plain text
- ✅ Secure password verification

### **3. Role Validation**
- ✅ Role checked on **every protected endpoint**
- ✅ Token role validated against database
- ✅ Automatic 403 Forbidden for unauthorized access

### **4. Database Security**
- ✅ Supabase Row Level Security (RLS) enabled
- ✅ Service role key for backend operations
- ✅ User role stored and validated in database

---

## 🚀 Adding New Protected Endpoints

### **Step 1: Define the Endpoint**

```python
# In backend/api/routes/hr.py
from api.deps import require_hr

@router.get("/new-hr-endpoint")
async def new_hr_endpoint(current_user: User = Depends(require_hr)):
    """
    Your new HR-only endpoint.
    
    **Access:** HR only
    """
    logger.info(f"🔒 [RBAC-HR] New endpoint accessed by: {current_user.email}")
    return {
        "message": "HR data",
      "accessed_by": current_user.email
    }
```

### **Step 2: Register the Router** (Already done in `main.py`)

```python
app.include_router(hr.router)
```

### **Step 3: Test**

```bash
curl -H "Authorization: Bearer <hr_token>" \
  "http://localhost:8000/hr/new-hr-endpoint"
```

---

## 🛡️ Error Responses

### **401 Unauthorized** (Invalid/Missing Token)
```json
{
  "detail": "Could not validate credentials"
}
```

### **403 Forbidden** (Valid Token, Wrong Role)
```json
{
  "detail": "Access denied. Required roles: ['hr']"
}
```

### **400 Bad Request** (Inactive User)
```json
{
  "detail": "Inactive user"
}
```

---

## 📝 Next Steps

1. **Run Database Migration** (if not done):
   ```bash
   cd backend/database
  # Fresh setup: run 001_create_users_table.sql
  # Existing setup: run 002_migrate_users_to_email_pk.sql
   ```

2. **Test RBAC**:
   ```bash
   python test_rbac.py
   ```

3. **Integrate with Frontend**:
   - Store JWT token in localStorage after login
   - Add `Authorization: Bearer <token>` to all API requests
   - Decode token to show user info (role, name, etc.)
   - Implement role-based UI (show/hide features by role)

4. **Production Considerations**:
   - [ ] Implement token refresh mechanism
   - [ ] Add token blacklist for logout (optional)
   - [ ] Set up HTTPS for production
   - [ ] Configure proper CORS origins
   - [ ] Add rate limiting
   - [ ] Implement audit logging

---

## 🎯 Summary

✅ **RBAC is fully implemented** with 4 distinct roles  
✅ **Login/Logout/Register** endpoints are available  
✅ **JWT tokens** secure all protected endpoints  
✅ **Comprehensive logging** tracks all auth events  
✅ **Test suite** validates RBAC functionality  
✅ **Scalable design** makes adding new roles easy  

**Visit http://localhost:8000/docs to interact with the API!** 🚀
