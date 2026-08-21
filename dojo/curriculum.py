"""Checked-in course manifest: parts -> lesson slugs -> exercise names.

Single source of truth for curriculum order. `dojo status`/`dojo next` render
from this; `dojo verify` lints it against the actual lessons/ tree.
"""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class LessonSpec:
    slug: str
    core: tuple[str, ...]
    challenge: bool = False
    review: bool = False

    @property
    def number(self) -> int:
        return int(self.slug.split("_", 1)[0])

    def exercise_dirs(self) -> list[str]:
        dirs = list(self.core)
        if self.challenge:
            dirs.append("challenge")
        if self.review:
            dirs.append("review1")
        return dirs

    def test_name(self, exercise_dir: str) -> str:
        return f"test_{exercise_dir}"

    def exercise_id(self, exercise_dir: str) -> str:
        return f"{self.slug}::{self.test_name(exercise_dir)}"

    def core_ids(self) -> list[str]:
        return [self.exercise_id(e) for e in self.core]


def _l(slug: str, n_core: int, challenge: bool = False, review: bool = False) -> LessonSpec:
    return LessonSpec(slug, tuple(f"ex{i}" for i in range(1, n_core + 1)), challenge, review)


PARTS: list[tuple[str, list[LessonSpec]]] = [
    ("Part 0 — Orientation", [
        _l("00_hello_dojo", 4),
    ]),
    ("Part 1 — SQL fundamentals", [
        _l("01_select_basics", 6, challenge=True, review=True),
        _l("02_where_filtering", 6, challenge=True, review=True),
        _l("03_order_limit", 6, challenge=True, review=True),
        _l("04_expressions_functions", 4, challenge=True, review=True),
        _l("05_null_logic", 4, challenge=True, review=True),
        _l("06_aggregates", 4, challenge=True, review=True),
        _l("07_group_by_having", 4, challenge=True, review=True),
        _l("08_inner_joins", 6, challenge=True, review=True),
        _l("09_outer_joins", 4, challenge=True, review=True),
        _l("10_self_joins_hierarchies", 4, challenge=True, review=True),
        _l("11_set_operations", 4, challenge=True, review=True),
        _l("12_fundamentals_capstone", 6, review=True),
    ]),
    ("Part 2 — Intermediate querying", [
        _l("13_subqueries", 6, challenge=True, review=True),
        _l("14_ctes", 6, challenge=True, review=True),
        _l("15_window_functions_1", 6, challenge=True, review=True),
        _l("16_window_functions_2", 6, challenge=True, review=True),
        _l("17_conditional_pivots", 4, challenge=True, review=True),
        _l("18_dates_times", 4, challenge=True, review=True),
        _l("19_text_jsonb", 6, challenge=True, review=True),
        _l("20_querying_capstone", 6, review=True),
    ]),
    ("Part 3 — Modifying data and transactions", [
        _l("21_insert_update_delete", 6, challenge=True),
        _l("22_upsert", 4, challenge=True),
        _l("23_transactions", 4),
    ]),
    ("Part 4 — Schema design and modeling", [
        _l("24_ddl_and_types", 4),
        _l("25_constraints", 6, challenge=True),
        _l("26_normalization", 4),
        _l("27_views", 4),
        _l("28_altering_live_schemas", 4),
        _l("29_design_capstone", 4),
    ]),
    ("Part 5 — Performance and indexing", [
        _l("30_reading_explain", 4),
        _l("31_first_index", 4, challenge=True),
        _l("32_composite_indexes", 4),
        _l("33_left_prefix", 4),
        _l("34_index_only_scans", 4),
        _l("35_order_by_and_indexes", 4),
        _l("36_statistics_and_the_planner", 4),
        _l("37_join_algorithms", 4),
        _l("38_bitmap_scans", 4),
        _l("39_partial_indexes", 4),
        _l("40_expression_indexes", 4),
        _l("41_gin_fulltext", 4),
        _l("42_gin_jsonb", 4),
        _l("43_gist_brin", 4),
        _l("44_mvcc_vacuum_bloat", 4),
        _l("45_partitioning", 4),
        _l("46_materialized_views", 4),
    ]),
    ("Part 6 — Capstone", [
        _l("47_capstone", 6),
    ]),
    ("Part 7 — Advanced patterns (bonus)", [
        _l("48_lateral_joins", 4, challenge=True),
        _l("49_distinct_on", 4, challenge=True),
        _l("50_grouping_sets", 4, challenge=True),
    ]),
    ("Part 8 — Optimization patterns (bonus)", [
        _l("51_query_rewrites", 4, challenge=True),
        _l("52_keyset_pagination", 4, challenge=True),
    ]),
    ("Part 9 — Interview prep", [
        _l("53_interview_concepts", 4, review=True),
        _l("54_interview_drills", 5, challenge=True, review=True),
    ]),
]


def all_lessons() -> list[LessonSpec]:
    return [spec for _, lessons in PARTS for spec in lessons]


def lesson(slug: str) -> LessonSpec | None:
    for spec in all_lessons():
        if spec.slug == slug:
            return spec
    return None
