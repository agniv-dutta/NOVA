import socket
from urllib.parse import urlparse
from supabase import create_client, Client
from core.config import settings

# Initialize Supabase client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

# Service role client for admin operations (bypasses RLS)
supabase_admin: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


def get_supabase() -> Client:
    """Get Supabase client for user operations."""
    return supabase


def get_supabase_admin() -> Client:
    """Get Supabase admin client for privileged operations."""
    return supabase_admin


def get_supabase_hostname() -> str:
    """Extract hostname from SUPABASE_URL for diagnostics."""
    parsed = urlparse(settings.SUPABASE_URL)
    if parsed.hostname:
        return parsed.hostname
    # Fallback for malformed URLs to avoid raising at startup.
    return settings.SUPABASE_URL.split("/")[0]


def is_supabase_host_resolvable() -> bool:
    """Check whether Supabase hostname resolves in DNS."""
    host = get_supabase_hostname()
    if not host:
        return False
    try:
        socket.getaddrinfo(host, 443)
        return True
    except OSError:
        return False
