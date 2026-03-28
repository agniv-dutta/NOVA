from fastapi import APIRouter, Depends
from models.user import User
from api.deps import require_any_authenticated

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
