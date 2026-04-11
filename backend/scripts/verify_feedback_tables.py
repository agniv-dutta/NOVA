from __future__ import annotations

import os
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv
import psycopg2


def main() -> None:
    backend_dir = Path(__file__).resolve().parents[1]
    load_dotenv(backend_dir / '.env')

    supabase_url = os.getenv('SUPABASE_URL', '').strip()
    password = os.getenv('DATABASE_PASSWORD', '').strip().strip('"')
    if not supabase_url or not password:
        raise SystemExit('Missing SUPABASE_URL or DATABASE_PASSWORD in backend/.env')

    project_ref = urlparse(supabase_url).netloc.split('.')[0]
    with psycopg2.connect(
        host=f'db.{project_ref}.supabase.co',
        dbname='postgres',
        user='postgres',
        password=password,
        port=5432,
        sslmode='require',
    ) as conn:
        with conn.cursor() as cur:
            cur.execute("select to_regclass('public.feedback_sessions')::text, to_regclass('public.session_consent_log')::text")
            print(cur.fetchone())


if __name__ == '__main__':
    main()
