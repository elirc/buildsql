"""Persistent sandbox clones: `dojo lab`."""
from __future__ import annotations

import subprocess

from dojo import db
from dojo.config import ROOT, load_config
from dojo.lesson import Lesson


def lab(slug: str, fresh: bool = True) -> int:
    cfg = load_config()
    lesson_dir = ROOT / "lessons" / slug
    clone = f"dojo_lab_{slug}"
    if fresh or not db.database_exists(clone):
        print(f"Cloning {cfg.template_db} -> {clone} ...")
        db.clone_template(clone)
        lesson = Lesson(lesson_dir / "test_lesson.py")
        if lesson.setup_sql.strip():
            print("Applying lesson setup.sql ...")
            with db.connect(clone) as conn:
                lesson.apply_setup(conn)
    print(f"Opening psql in {clone} (\\q to exit). Experiment freely - this clone is yours.")
    return subprocess.call(
        ["docker", "compose", "exec", "db", "psql", "-U", cfg.user, "-d", clone],
        cwd=ROOT,
    )


def clean() -> None:
    for name in db.list_databases("dojo_lab_"):
        print(f"Dropping {name}")
        db.drop_database(name)
