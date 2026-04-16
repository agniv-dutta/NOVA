"""PII redaction helpers for API responses and logs."""

from __future__ import annotations


def mask_email(value: str) -> str:
    email = (value or "").strip()
    if "@" not in email:
        return email
    local, domain = email.split("@", 1)
    if len(local) <= 2:
        masked_local = "*" * len(local)
    else:
        masked_local = f"{local[0]}{'*' * (len(local) - 2)}{local[-1]}"
    return f"{masked_local}@{domain}"


def mask_ip(value: str) -> str:
    ip = (value or "").strip()
    if not ip:
        return ip
    if "." in ip:
        parts = ip.split(".")
        if len(parts) == 4:
            return f"{parts[0]}.{parts[1]}.*.*"
    if ":" in ip:
        parts = ip.split(":")
        if len(parts) >= 3:
            return ":".join(parts[:3] + ["*"])
    return "masked"


def mask_free_text(value: str, max_visible: int = 24) -> str:
    text = (value or "").strip()
    if len(text) <= max_visible:
        return text
    return f"{text[:max_visible]}..."
