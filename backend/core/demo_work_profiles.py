from __future__ import annotations

import hashlib
import random
from datetime import datetime, timedelta, timezone

from ai.skill_matcher import _embed

DEMO_PASSWORD_HASH = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"

NAME_POOL = [
    "Aarav Mehta",
    "Vivaan Kapoor",
    "Aditya Nair",
    "Rohan Kulkarni",
    "Ishaan Verma",
    "Kunal Deshmukh",
    "Rahul Iyer",
    "Siddharth Rao",
    "Arnav Banerjee",
    "Dhruv Chawla",
    "Priya Menon",
    "Ananya Gupta",
    "Sneha Reddy",
    "Kavya Sharma",
    "Neha Joshi",
    "Ritika Singh",
    "Pooja Nair",
    "Meera Kulkarni",
    "Aisha Khan",
    "Nidhi Bansal",
    "Tanvi Patil",
    "Harsh Vardhan",
    "Yash Malhotra",
    "Pranav Shah",
    "Akash Tiwari",
    "Nikhil Soni",
    "Devansh Arora",
    "Saurabh Jha",
    "Manav Pillai",
    "Varun Mishra",
    "Rhea Kapoor",
    "Ira Mukherjee",
    "Diya Sinha",
    "Ankita Das",
    "Sakshi Jain",
    "Shruti Rao",
    "Maya Iyer",
    "Trisha Sen",
    "Esha Dubey",
    "Komal Yadav",
]

SKILL_TRACKS = [
    ["Python", "FastAPI", "PostgreSQL", "Docker", "REST APIs"],
    ["TypeScript", "React", "Tailwind CSS", "Vite", "UI Testing"],
    ["Java", "Spring Boot", "MySQL", "Redis", "Microservices"],
    ["Node.js", "Express", "MongoDB", "CI/CD", "Jest"],
    ["Data Analysis", "Pandas", "SQL", "Power BI", "Experimentation"],
    ["SRE", "Kubernetes", "Terraform", "Grafana", "Incident Response"],
    ["Security", "OAuth", "IAM", "Threat Modeling", "Audit Logging"],
]

COMMIT_MESSAGES = [
    "Refactor API response validation for assignment pipeline",
    "Improve dashboard chart rendering performance",
    "Add retry handling for webhook integrations",
    "Tighten auth checks and role guard coverage",
    "Fix edge-case parsing in analytics aggregation",
    "Add unit tests for talent match scoring",
    "Improve error surfacing in profile synchronization",
]


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _seeded_rng(key: str) -> random.Random:
    digest = hashlib.sha256(key.encode("utf-8")).hexdigest()
    return random.Random(int(digest[:12], 16))


def _slug(name: str) -> str:
    return "".join(ch.lower() for ch in name if ch.isalnum())


def _build_demo_profile(email: str, full_name: str) -> dict:
    rng = _seeded_rng(email)
    skill_track = list(SKILL_TRACKS[rng.randrange(len(SKILL_TRACKS))])
    extra_skill = SKILL_TRACKS[(rng.randrange(len(SKILL_TRACKS)) + 2) % len(SKILL_TRACKS)][0]
    skills = list(dict.fromkeys(skill_track + [extra_skill]))

    total_commits = rng.randint(24, 260)
    avg_quality = round(rng.uniform(62.0, 93.0), 1)
    days_ago = rng.randint(0, 16)
    last_commit_at = (datetime.now(timezone.utc) - timedelta(days=days_ago, hours=rng.randint(0, 20))).isoformat()

    primary_focus = ", ".join(skills[:3])
    summary = (
        f"{full_name} shows strong delivery in {primary_focus}. "
        f"Recent commits indicate consistent ownership and reliable code quality."
    )

    username_root = _slug(full_name)[:14] or _slug(email.split("@")[0])

    return {
        "employee_email": email,
        "github_username": f"{username_root}{rng.randint(1, 9)}",
        "jira_account_id": f"712020:{hashlib.sha1(email.encode('utf-8')).hexdigest()[:12]}",
        "skills": skills,
        "skill_embeddings": _embed(", ".join(skills)),
        "total_commits": total_commits,
        "avg_code_quality": avg_quality,
        "profile_summary": summary,
        "last_commit_at": last_commit_at,
        "created_at": _now(),
        "updated_at": _now(),
    }


def _build_demo_commits(email: str, github_username: str, skills: list[str]) -> list[dict]:
    rng = _seeded_rng(f"commit::{email}")
    repo_name = "nova-platform"
    commits: list[dict] = []

    for idx in range(3):
        commit_time = datetime.now(timezone.utc) - timedelta(days=idx + rng.randint(0, 7), hours=rng.randint(0, 20))
        commit_hash = hashlib.sha1(f"{email}:{idx}".encode("utf-8")).hexdigest()
        lines_added = rng.randint(24, 240)
        lines_deleted = rng.randint(8, 110)
        quality_score = round(rng.uniform(58.0, 95.0), 1)
        if quality_score >= 75:
            quality_label = "good"
        elif quality_score >= 55:
            quality_label = "neutral"
        else:
            quality_label = "poor"

        commits.append(
            {
                "employee_email": email,
                "github_username": github_username,
                "commit_hash": commit_hash,
                "commit_message": COMMIT_MESSAGES[(idx + rng.randint(0, len(COMMIT_MESSAGES) - 1)) % len(COMMIT_MESSAGES)],
                "repository": repo_name,
                "branch": "main",
                "diff_summary": "Updated services and tests to improve reliability and maintainability.",
                "skills_demonstrated": skills[: min(len(skills), 4)],
                "code_quality_score": quality_score,
                "code_quality_label": quality_label,
                "complexity": "medium" if lines_added > 120 else "low",
                "impact": "major" if lines_added > 180 else "moderate",
                "quality_reasoning": "Changes include tests and guard clauses with clear module boundaries.",
                "triggered_profile_update": True,
                "lines_added": lines_added,
                "lines_deleted": lines_deleted,
                "files_changed": rng.randint(2, 11),
                "committed_at": commit_time.isoformat(),
                "created_at": _now(),
            }
        )

    return commits


def ensure_demo_work_profiles(sb, minimum_profiles: int = 30) -> dict[str, int]:
    """
    Ensure enough users and work profiles exist for demo scenarios.

    This function is idempotent: existing users/profiles are preserved,
    only missing demo records are inserted.
    """
    users_r = sb.table("users").select("email,full_name,role").execute()
    users = users_r.data or []

    candidate_users = [u for u in users if (u.get("role") in {"employee", "manager"})]
    created_users = 0
    if len(candidate_users) < minimum_profiles:
        existing_emails = {str(u.get("email") or "").lower() for u in users}
        inserts = []
        for index, full_name in enumerate(NAME_POOL, start=1):
            if len(candidate_users) + len(inserts) >= minimum_profiles:
                break
            email = f"demo.user{index:02d}@company.com"
            if email in existing_emails:
                continue
            inserts.append(
                {
                    "email": email,
                    "full_name": full_name,
                    "role": "employee",
                    "hashed_password": DEMO_PASSWORD_HASH,
                    "disabled": False,
                }
            )

        if inserts:
            sb.table("users").insert(inserts).execute()
            created_users = len(inserts)

        users_r = sb.table("users").select("email,full_name,role").execute()
        users = users_r.data or []
        candidate_users = [u for u in users if (u.get("role") in {"employee", "manager"})]

    candidate_users.sort(key=lambda row: str(row.get("email") or ""))
    target_users = candidate_users[:minimum_profiles]

    profiles_r = sb.table("employee_work_profiles").select(
        "employee_email,github_username,skills,total_commits"
    ).execute()
    profiles = profiles_r.data or []
    profile_map = {str(p.get("employee_email") or "").lower(): p for p in profiles}

    profile_inserts = []
    for user in target_users:
        email = str(user.get("email") or "").lower()
        if email in profile_map:
            continue
        profile_inserts.append(_build_demo_profile(email, str(user.get("full_name") or email.split("@")[0])))

    if profile_inserts:
        sb.table("employee_work_profiles").insert(profile_inserts).execute()

    commit_counts_r = sb.table("commit_analyses").select("employee_email").in_(
        "employee_email", [str(u.get("email") or "").lower() for u in target_users]
    ).execute()
    commit_counts = commit_counts_r.data or []
    with_commits = {str(row.get("employee_email") or "").lower() for row in commit_counts}

    commit_inserts: list[dict] = []
    fresh_profiles_r = sb.table("employee_work_profiles").select(
        "employee_email,github_username,skills"
    ).in_("employee_email", [str(u.get("email") or "").lower() for u in target_users]).execute()
    fresh_profiles = fresh_profiles_r.data or []

    for profile in fresh_profiles:
        email = str(profile.get("employee_email") or "").lower()
        if not email or email in with_commits:
            continue
        commit_inserts.extend(
            _build_demo_commits(
                email=email,
                github_username=str(profile.get("github_username") or email.split("@")[0]),
                skills=[str(s) for s in (profile.get("skills") or [])],
            )
        )

    if commit_inserts:
        sb.table("commit_analyses").insert(commit_inserts).execute()

    return {
        "created_users": created_users,
        "created_profiles": len(profile_inserts),
        "created_commits": len(commit_inserts),
    }
