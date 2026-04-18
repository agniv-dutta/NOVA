"""
JIRA API client for NOVA.

Currently handles: assigning an issue to an employee by accountId.
Credentials are read from core.config (JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN).
"""

from __future__ import annotations

import base64
import logging

import httpx

logger = logging.getLogger(__name__)


def _load_jira_credentials_from_integration_config() -> tuple[str, str, str]:
    """Best-effort credentials fallback from persisted Jira integration config."""
    try:
        from core.database import get_supabase_admin

        sb = get_supabase_admin()
        r = (
            sb.table("integration_configs")
            .select("config,is_active")
            .eq("integration_type", "jira")
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        row = (r.data or [None])[0]
        if not row or not bool(row.get("is_active")):
            return "", "", ""
        config = row.get("config") or {}
        base_url = str(config.get("base_url") or config.get("cloud_url") or "").rstrip("/")
        email = str(config.get("email") or "")
        api_token = str(config.get("api_token") or "")
        return base_url, email, api_token
    except Exception:
        return "", "", ""


async def assign_jira_issue(issue_key: str, account_id: str) -> bool:
    """
    Assign a JIRA issue to the user identified by `account_id`.

    Uses Basic auth (email:api_token).  Returns True on success, False on
    any error - callers should treat JIRA sync as best-effort and never fail
    the NOVA approval flow because of it.
    """
    from core.config import settings

    base_url = (settings.JIRA_BASE_URL or "").rstrip("/")
    email = settings.JIRA_EMAIL
    api_token = settings.JIRA_API_TOKEN

    if not all([base_url, email, api_token]):
        cfg_base_url, cfg_email, cfg_token = _load_jira_credentials_from_integration_config()
        base_url = base_url or cfg_base_url
        email = email or cfg_email
        api_token = api_token or cfg_token

    if not all([base_url, email, api_token]):
        logger.warning("JIRA assign skipped - Jira credentials missing in env and integration config")
        return False

    if not account_id:
        logger.warning("JIRA assign skipped - no accountId for issue %s", issue_key)
        return False

    credentials = base64.b64encode(f"{email}:{api_token}".encode()).decode()
    url = f"{base_url}/rest/api/3/issue/{issue_key}/assignee"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.put(
                url,
                headers={
                    "Authorization": f"Basic {credentials}",
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                json={"accountId": account_id},
            )
        if res.status_code in (200, 204):
            logger.info("JIRA: assigned %s to accountId=%s", issue_key, account_id)
            return True
        logger.warning(
            "JIRA assign failed for %s (accountId=%s): HTTP %s - %s",
            issue_key, account_id, res.status_code, res.text[:200],
        )
        return False
    except Exception as exc:
        logger.error("JIRA assign error for %s: %s", issue_key, exc)
        return False
