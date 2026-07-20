"""Deterministic data generator -> dojo_template.

Fixed RNG seeds and a fixed epoch base make the dataset identical on every
machine. Bulk load happens over COPY text protocol for speed. DOJO_SCALE
(float, default 1.0) multiplies row counts for fast CI seeding.
"""
from __future__ import annotations

import json
import os
import random
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

from psycopg import sql

from dojo import db
from dojo.config import load_config

SEED = 1234
BASE_EPOCH = 1_700_000_000
BASE_DT = datetime.fromtimestamp(BASE_EPOCH, tz=timezone.utc)

YEAR = 365 * 24 * 3600

COUNTRIES = ["US", "US", "US", "US", "GB", "GB", "DE", "DE", "FR", "CA", "AU", "JP", "BR", "IN", "PH", "MX", "ES"]
CATEGORIES = ["books", "electronics", "garden", "toys", "clothing", "food"]
COLORS = ["red", "blue", "green", "black", "white"]
SIZES = ["s", "m", "l", "xl"]
TAGS = ["sale", "new", "eco", "premium", "clearance", "bestseller", "limited", "classic", "handmade", "imported"]
STATUSES = ["pending", "paid", "paid", "paid", "shipped", "cancelled"]
EVENT_TYPES = ["view"] * 6 + ["click"] * 3 + ["add_to_cart"] * 2 + ["purchase", "logout"]
DEPARTMENTS = ["sales", "support", "engineering", "ops", "finance"]

ADJECTIVES = ["Aero", "Prime", "Nova", "Solid", "Swift", "Lunar", "Rustic", "Urban", "Vivid", "Zen",
              "Atlas", "Ember", "Frost", "Golden", "Ivory", "Jade", "Koa", "Mystic", "Onyx", "Pico"]
NOUNS = ["Widget", "Lamp", "Chair", "Kettle", "Journal", "Speaker", "Blanket", "Trowel", "Puzzle", "Jacket",
         "Mug", "Router", "Shovel", "Doll", "Scarf", "Crackers", "Novel", "Tablet", "Planter", "Blocks"]

REVIEW_PHRASES = [
    "The battery life is excellent.", "Shipping was slow but worth the wait.",
    "Feels durable and well made.", "A bit flimsy for the price.",
    "The color matches the photos perfectly.", "Would recommend to a friend.",
    "Stopped working after a week.", "Customer support was helpful.",
    "Great value for money.", "The size runs small.",
    "Packaging was damaged on arrival.", "Exceeded my expectations.",
    "The instructions were confusing.", "Perfect gift for kids.",
    "Quality has gone downhill lately.", "Five stars, absolutely love it.",
]


def scale() -> float:
    return float(os.environ.get("DOJO_SCALE", "1.0"))


def row_counts() -> dict[str, int]:
    s = scale()
    return {
        "customers": max(100, int(50_000 * s)),
        "products": max(60, int(10_000 * s)),
        "orders": max(500, int(500_000 * s)),
        "order_items": max(1000, int(1_000_000 * s)),
        "reviews": max(1000, int(1_000_000 * s)),
        "events": max(3000, int(3_000_000 * s)),
        "staff": max(50, int(500 * s)),
    }


def _esc(s: str) -> str:
    """Escape a text value for COPY text format."""
    return (
        s.replace("\\", "\\\\")
        .replace("\t", "\\t")
        .replace("\n", "\\n")
        .replace("\r", "\\r")
    )


def _ts(epoch: float) -> str:
    dt = BASE_DT + timedelta(seconds=epoch - BASE_EPOCH)
    return dt.strftime("%Y-%m-%d %H:%M:%S+00")


def _copy_lines(conn, table: str, columns: list[str], lines) -> int:
    """Stream pre-formatted COPY text lines into a table. Returns row count."""
    stmt = sql.SQL("COPY {} ({}) FROM STDIN").format(
        sql.Identifier(table),
        sql.SQL(", ").join(sql.Identifier(c) for c in columns),
    )
    n = 0
    buf: list[str] = []
    with conn.cursor() as cur:
        with cur.copy(stmt) as copy:
            for line in lines:
                buf.append(line)
                n += 1
                if len(buf) >= 20_000:
                    copy.write("".join(buf))
                    buf.clear()
            if buf:
                copy.write("".join(buf))
    return n


def _load_faker():
    from faker import Faker

    Faker.seed(SEED)
    return Faker()


def gen_customers(rng: random.Random, fake, n: int):
    for i in range(1, n + 1):
        name = _esc(fake.name())
        email = f"user{i}@example.com"
        country = rng.choice(COUNTRIES)
        created = BASE_EPOCH - 2 * YEAR + rng.random() * 2 * YEAR
        yield f"{i}\t{name}\t{email}\t{country}\t{_ts(created)}\n"


def gen_products(rng: random.Random, fake, n: int) -> list[str]:
    sentence_pool = [fake.sentence(nb_words=10) for _ in range(300)]
    lines = []
    prices: list[str] = [""]  # 1-indexed
    for i in range(1, n + 1):
        name = f"{rng.choice(ADJECTIVES)} {rng.choice(NOUNS)} {i}"
        category = rng.choice(CATEGORIES)
        price = round(rng.uniform(1, 500), 2)
        prices.append(f"{price:.2f}")
        desc = _esc(rng.choice(sentence_pool) + " " + rng.choice(sentence_pool))
        attrs = json.dumps(
            {
                "color": rng.choice(COLORS),
                "size": rng.choice(SIZES),
                "tags": rng.sample(TAGS, 2),
            }
        )
        lines.append(f"{i}\t{name}\t{category}\t{price:.2f}\t{desc}\t{_esc(attrs)}\n")
    return lines, prices


def gen_orders(rng: random.Random, n: int, n_customers: int):
    # Only the first ~90% of customers ever order: the newest signups never
    # bought anything, which gives the outer-join/anti-join lessons real prey.
    buying = max(1, int(n_customers * 0.9))
    for i in range(1, n + 1):
        cust = rng.randint(1, buying)
        status = rng.choice(STATUSES)
        total = round(rng.uniform(5, 2000), 2)
        created = BASE_EPOCH - YEAR + rng.random() * YEAR
        yield f"{i}\t{cust}\t{status}\t{total:.2f}\t{_ts(created)}\n"


def gen_order_items(rng: random.Random, n: int, n_orders: int, prices: list[str]):
    # The last ~3% of products are never ordered (new stock nobody bought yet).
    n_products = len(prices) - 1
    sellable = max(1, int(n_products * 0.97))
    for i in range(1, n + 1):
        order = rng.randint(1, n_orders)
        product = rng.randint(1, sellable)
        qty = rng.randint(1, 5)
        yield f"{i}\t{order}\t{product}\t{qty}\t{prices[product]}\n"


def gen_reviews(rng: random.Random, fake, n: int, n_products: int):
    body_pool = [_esc(fake.paragraph(nb_sentences=3)) for _ in range(800)]
    for i in range(1, n + 1):
        product = rng.randint(1, n_products)
        rating = rng.randint(1, 5)
        body = rng.choice(body_pool) + " " + rng.choice(REVIEW_PHRASES)
        created = BASE_EPOCH - YEAR + rng.random() * YEAR
        yield f"{i}\t{product}\t{rating}\t{body}\t{_ts(created)}\n"


def gen_events(rng: random.Random, n: int, n_customers: int, n_products: int):
    for i in range(1, n + 1):
        cust = rng.randint(1, n_customers)
        etype = rng.choice(EVENT_TYPES)
        payload = json.dumps(
            {"path": f"/p/{rng.randint(1, n_products)}", "value": rng.randint(0, 1000)}
        )
        ts = _ts(BASE_EPOCH - n + i)
        yield f"{i}\t{cust}\t{etype}\t{_esc(payload)}\t{ts}\n"


def gen_staff(rng: random.Random, fake, n: int):
    """A single-root management forest, depth 3-4, departments inherited."""
    n_l1 = max(3, n // 40)
    n_l2 = max(6, n // 6)
    rows = []
    dept_of: dict[int, str] = {}
    depth_of: dict[int, int] = {}

    def salary(depth: int) -> float:
        return {
            0: 250_000.0,
            1: rng.uniform(120_000, 200_000),
            2: rng.uniform(80_000, 150_000),
            3: rng.uniform(40_000, 100_000),
        }[depth]

    l1_ids = list(range(2, 2 + n_l1))
    l2_ids = list(range(2 + n_l1, 2 + n_l1 + n_l2))
    l3_ids = list(range(2 + n_l1 + n_l2, n + 1))

    for i in range(1, n + 1):
        if i == 1:
            manager, depth = None, 0
            dept = "ops"
        elif i in l1_ids:
            manager, depth = 1, 1
            dept = DEPARTMENTS[(i - 2) % len(DEPARTMENTS)]
        elif i in l2_ids:
            manager, depth = rng.choice(l1_ids), 2
            dept = dept_of[manager]
        else:
            manager, depth = rng.choice(l2_ids), 3
            dept = dept_of[manager]
        dept_of[i] = dept
        depth_of[i] = depth
        sal = salary(depth)
        hired = BASE_DT - timedelta(days=rng.randint(30, 3650))
        mgr = "\\N" if manager is None else str(manager)
        rows.append(
            f"{i}\t{_esc(fake.name())}\t{dept}\t{mgr}\t{sal:.2f}\t{hired.strftime('%Y-%m-%d')}\n"
        )
    return rows


def seed() -> None:
    cfg = load_config()
    counts = row_counts()
    rng = random.Random(SEED)
    fake = _load_faker()

    print(f"Rebuilding template database '{cfg.template_db}' (scale={scale()}) ...")
    db.drop_database(cfg.template_db)
    with db.connect(autocommit=True) as conn:
        conn.execute(
            sql.SQL("CREATE DATABASE {}").format(sql.Identifier(cfg.template_db))
        )

    schema = (Path(__file__).parent / "schema.sql").read_text()
    with db.connect(cfg.template_db) as conn:
        conn.execute(schema)
        conn.commit()

        t0 = time.monotonic()

        def load(table, columns, lines):
            start = time.monotonic()
            n = _copy_lines(conn, table, columns, lines)
            conn.commit()
            print(f"  {table:<12} {n:>10,} rows  ({time.monotonic() - start:.1f}s)")

        load("customers", ["id", "name", "email", "country", "created_at"],
             gen_customers(rng, fake, counts["customers"]))
        product_lines, prices = gen_products(rng, fake, counts["products"])
        load("products", ["id", "name", "category", "price", "description", "attributes"],
             product_lines)
        load("orders", ["id", "customer_id", "status", "total", "created_at"],
             gen_orders(rng, counts["orders"], counts["customers"]))
        load("order_items", ["id", "order_id", "product_id", "quantity", "price"],
             gen_order_items(rng, counts["order_items"], counts["orders"], prices))
        load("reviews", ["id", "product_id", "rating", "body", "created_at"],
             gen_reviews(rng, fake, counts["reviews"], counts["products"]))
        load("events", ["id", "customer_id", "event_type", "payload", "ts"],
             gen_events(rng, counts["events"], counts["customers"], counts["products"]))
        load("staff", ["id", "name", "department", "manager_id", "salary", "hired_on"],
             gen_staff(rng, fake, counts["staff"]))

        print(f"  data generation total: {time.monotonic() - t0:.1f}s")

    # VACUUM can't run inside a transaction; use an autocommit connection.
    # This ships the template with fresh statistics AND a populated visibility
    # map (clones inherit it - index-only scans depend on it).
    print("  VACUUM ANALYZE ...")
    with db.connect(cfg.template_db, autocommit=True) as conn:
        conn.execute("VACUUM ANALYZE")

    from dojo.facts import write_facts

    write_facts()
    print("Done. Template ready; docs/dataset_facts.md regenerated.")
