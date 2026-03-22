"""Lightweight Supabase REST client using httpx.

Replaces the official supabase-py SDK which fails to install on Python 3.14
due to pyiceberg requiring a Rust compiler. This client uses the Supabase
PostgREST API directly via httpx.
"""

import os
import httpx


class SupabaseClient:
    """Minimal Supabase client that talks directly to the PostgREST API."""

    def __init__(self, url: str, key: str):
        self.url = url.rstrip("/")
        self.rest_url = f"{self.url}/rest/v1"
        self.headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }
        self._client = httpx.Client(timeout=15.0)

    def _request(self, method: str, path: str, params: dict = None, json_data=None, extra_headers: dict = None):
        """Make an HTTP request to the Supabase REST API."""
        url = f"{self.rest_url}/{path}"
        headers = {**self.headers}
        if extra_headers:
            headers.update(extra_headers)

        resp = self._client.request(method, url, params=params or {}, json=json_data, headers=headers)
        resp.raise_for_status()
        return resp.json() if resp.text else []

    def select(self, table: str, columns: str = "*", filters: dict = None, order: str = None, limit: int = None) -> list:
        """SELECT rows from a table.

        Args:
            table: Table name.
            columns: Comma-separated list of columns (supports PostgREST select syntax like "*, vendors(name)").
            filters: Dict of column=value exact-match filters.
            order: Column to order by, prefix with "-" for desc (e.g., "-rating").
            limit: Max number of rows.
        """
        params = {"select": columns}
        if filters:
            for col, val in filters.items():
                params[col] = f"eq.{val}"
        if order:
            if order.startswith("-"):
                params["order"] = f"{order[1:]}.desc"
            else:
                params["order"] = f"{order}.asc"
        if limit:
            params["limit"] = str(limit)

        return self._request("GET", table, params=params)

    def insert(self, table: str, data: dict | list) -> list:
        """INSERT one or more rows."""
        if isinstance(data, dict):
            data = [data]
        return self._request("POST", table, json_data=data)

    def upsert(self, table: str, data: dict | list, on_conflict: str = None) -> list:
        """UPSERT (insert or update on conflict)."""
        if isinstance(data, dict):
            data = [data]
        extra = {}
        if on_conflict:
            extra["Prefer"] = f"return=representation,resolution=merge-duplicates"
        params = {}
        if on_conflict:
            params["on_conflict"] = on_conflict
        return self._request("POST", table, params=params, json_data=data, extra_headers=extra)

    def update(self, table: str, data: dict, filters: dict) -> list:
        """UPDATE rows matching filters."""
        params = {}
        for col, val in filters.items():
            params[col] = f"eq.{val}"
        return self._request("PATCH", table, params=params, json_data=data)

    def delete(self, table: str, filters: dict) -> list:
        """DELETE rows matching filters."""
        params = {}
        for col, val in filters.items():
            params[col] = f"eq.{val}"
        return self._request("DELETE", table, params=params)


# ─── Global client ───────────────────────────────────────────────────────────

_client: SupabaseClient | None = None


def init_supabase():
    """Initialize the global Supabase client."""
    global _client
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    if url and key:
        _client = SupabaseClient(url, key)
        print(f"✅ Supabase connected: {url}")
    else:
        print("⚠️ WARNING: SUPABASE_URL / SUPABASE_KEY not set. Database calls will fail.")


def get_db() -> SupabaseClient | None:
    """Get the global Supabase client."""
    return _client
