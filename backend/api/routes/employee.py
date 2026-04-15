from fastapi import APIRouter, Depends
from models.user import User
from api.deps import require_any_authenticated
import random

router = APIRouter(prefix="/employee", tags=["Employee"])


@router.get("/profile")
async def get_profile(current_user: User = Depends(require_any_authenticated)):
    """
    Get current employee's profile information.
    
    **Access:** All authenticated users
    """
    return {
        "message": "Employee profile",
        "profile": {
            "id": current_user.email,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "role": current_user.role,
            "department": "Engineering",
            "job_title": "Software Engineer",
            "hire_date": "2022-03-15"
        }
    }


@router.get("/benefits")
async def get_benefits(current_user: User = Depends(require_any_authenticated)):
    """
    Get employee benefits and perks information.
    
    **Access:** All authenticated users
    """
    return {
        "message": "Employee benefits",
        "accessed_by": current_user.email,
        "benefits": {
            "health_insurance": "Active",
            "vacation_days": {"total": 20, "used": 8, "remaining": 12},
            "pto_balance": 5,
            "retirement_401k": {"contribution": "5%", "match": "100% up to 5%"}
        }
    }


@router.get("/learning-resources")
async def get_learning_resources(current_user: User = Depends(require_any_authenticated)):
    """
    Get available learning and development resources.
    
    **Access:** All authenticated users
    """
    return {
        "message": "Learning resources",
        "accessed_by": current_user.email,
        "resources": [
            {
                "title": "Leadership Fundamentals",
                "type": "course",
                "duration": "4 hours",
                "status": "available"
            },
            {
                "title": "Technical Skills Bootcamp",
                "type": "workshop",
                "duration": "2 days",
                "status": "enrolled"
            }
        ]
    }


@router.get("/performance-summary")
async def get_performance_summary(current_user: User = Depends(require_any_authenticated)):
    """
    Get employee's own performance summary.
    
    **Access:** All authenticated users (can only see their own data)
    """
    return {
        "message": "Performance summary",
        "accessed_by": current_user.email,
        "summary": {
            "current_rating": 4.2,
            "goals_completed": 8,
            "goals_in_progress": 3,
            "recent_feedback": "Excellent collaboration and technical skills",
            "next_review_date": "2026-06-30"
        }
    }


@router.get("/onboarding")
async def get_onboarding_employees(current_user: User = Depends(require_any_authenticated)):
    """Return onboarding employees (<90 days) with onboarding-cohort adjusted risk signals."""
    profile_plan = [
        ("NEW001", "Arjun Sharma", "Engineering", ["Integration Risk"]),
        ("NEW002", "Priya Patel", "Engineering", ["Ramp Risk"]),
        ("NEW003", "Amit Sinha", "Sales", ["Isolation Risk"]),
        ("NEW004", "Sunita Kulkarni", "Sales", ["Integration Risk"]),
        ("NEW005", "Lakshmi Subramaniam", "HR", ["Ramp Risk"]),
        ("NEW006", "Ashish Kapoor", "HR", ["Isolation Risk"]),
        ("NEW007", "Nidhi Oberoi", "Design", ["Integration Risk"]),
        ("NEW008", "Ramesh Iyer", "Finance", ["Integration Risk", "Ramp Risk", "Isolation Risk"]),
    ]

    employees = []
    for idx, (employee_id, name, department, flags) in enumerate(profile_plan, start=1):
        random.seed(idx * 73)
        onboarding_day = random.randint(7, 85)
        peer_connections = random.randint(0, 6)
        manager_1_1_days_ago = random.randint(3, 30)
        performance_percentile = round(random.uniform(0.35, 0.82), 2)

        if "Integration Risk" in flags:
            peer_connections = min(peer_connections, 2)
        if "Ramp Risk" in flags:
            performance_percentile = min(performance_percentile, 0.49)
        if "Isolation Risk" in flags:
            manager_1_1_days_ago = max(manager_1_1_days_ago, 21)

        adjusted_risk = min(100, round(38 + (0.5 - performance_percentile) * 42 + len(flags) * 10, 1))
        employees.append({
            "employee_id": employee_id,
            "name": name,
            "department": department,
            "onboarding_day": onboarding_day,
            "is_onboarding": True,
            "adjusted_risk_score": adjusted_risk,
            "risk_flags": flags,
            "peer_network_connections": peer_connections,
            "manager_one_on_one_days_ago": manager_1_1_days_ago,
            "onboarding_performance_percentile": performance_percentile,
        })

    return {
        "requested_by": current_user.email,
        "count": len(employees),
        "employees": employees,
        "note": "Scores reflect onboarding cohort baseline, not org-wide average",
    }
