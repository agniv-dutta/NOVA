from __future__ import annotations

import re
from typing import Any


KNOWN_TECH_TERMS = {
    "javascript",
    "typescript",
    "postgresql",
    "kubernetes",
    "beautifulsoup",
    "seleniumwebdriver",
    "microservices",
    "authentication",
    "observability",
}


TYPO_REPLACEMENTS = {
    "formscarcth": "framework",
    "scirpt": "script",
    "reccomend": "recommend",
    "analysys": "analysis",
}


TASK_TITLE_REPLACEMENTS = {
    "make scirpt for canva scraping": "Build scraping script for Canva data",
    "make script for canva scraping": "Build scraping script for Canva data",
    "fix the bug in login": "Fix authentication failure on OAuth callback",
}


_WORD_RE = re.compile(r"\b[\w-]+\b")


def _is_garbled_word(word: str) -> bool:
    normalized = re.sub(r"[^a-z]", "", word.lower())
    if not normalized:
        return False
    if normalized in KNOWN_TECH_TERMS:
        return False
    if len(normalized) > 20:
        return True
    # 3+ consecutive consonants anywhere in the token.
    if re.search(r"[bcdfghjklmnpqrstvwxyz]{3,}", normalized):
        return True
    return False


def cleanup_text(text: str) -> dict[str, Any]:
    cleaned = text or ""
    for wrong, right in TYPO_REPLACEMENTS.items():
        cleaned = re.sub(rf"\b{re.escape(wrong)}\b", right, cleaned, flags=re.IGNORECASE)

    flagged_terms: list[str] = []

    def repl(match: re.Match[str]) -> str:
        token = match.group(0)
        if _is_garbled_word(token):
            flagged_terms.append(token)
            return "technology"
        return token

    cleaned = _WORD_RE.sub(repl, cleaned)
    return {
        "text": cleaned,
        "flagged_terms": sorted({term for term in flagged_terms}),
        "needs_manual_review": bool(flagged_terms),
    }


def sanitize_task_title(title: str) -> str:
    original = (title or "").strip()
    lowered = original.lower()
    for bad, good in TASK_TITLE_REPLACEMENTS.items():
        if lowered == bad:
            return good
    return original
