"""Environment loading -> Config dataclass."""
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent


@dataclass(frozen=True)
class Config:
    host: str
    port: int
    user: str
    password: str
    maintenance_db: str
    template_db: str


def load_config() -> Config:
    load_dotenv(ROOT / ".env")
    return Config(
        host=os.environ.get("POSTGRES_HOST", "127.0.0.1"),
        port=int(os.environ.get("POSTGRES_PORT", "5432")),
        user=os.environ.get("POSTGRES_USER", "dojo"),
        password=os.environ.get("POSTGRES_PASSWORD", "dojo"),
        maintenance_db=os.environ.get("POSTGRES_MAINTENANCE_DB", "postgres"),
        template_db=os.environ.get("DOJO_TEMPLATE_DB", "dojo_template"),
    )
