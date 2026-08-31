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
    ("Part 10 — Drill sets (volume 2)", [
        _l("55_drills_select_1", 8),
        _l("56_drills_select_2", 8),
        _l("57_drills_where_1", 8),
        _l("58_drills_where_2", 8),
        _l("59_drills_where_3", 8),
        _l("60_drills_order_limit_1", 8),
        _l("61_drills_order_limit_2", 8),
        _l("62_drills_expressions_1", 8),
        _l("63_drills_expressions_2", 8),
        _l("64_drills_case_1", 8),
        _l("65_drills_null_1", 8),
        _l("66_drills_null_2", 8),
        _l("67_drills_aggregates_1", 8),
        _l("68_drills_aggregates_2", 8),
        _l("69_drills_aggregates_3", 8),
        _l("70_drills_group_having_1", 8),
        _l("71_drills_group_having_2", 8),
        _l("72_drills_group_having_3", 8),
        _l("73_drills_inner_joins_1", 8),
        _l("74_drills_inner_joins_2", 8),
        _l("75_drills_inner_joins_3", 8),
        _l("76_drills_outer_joins_1", 8),
        _l("77_drills_outer_joins_2", 8),
        _l("78_drills_anti_semi_1", 8),
        _l("79_drills_self_joins_1", 8),
        _l("80_drills_set_ops_1", 8),
        _l("81_drills_multi_join_1", 8),
        _l("82_drills_multi_join_2", 8),
        _l("83_drills_subqueries_1", 8),
        _l("84_drills_subqueries_2", 8),
        _l("85_drills_subqueries_3", 8),
        _l("86_drills_exists_1", 8),
        _l("87_drills_ctes_1", 8),
        _l("88_drills_ctes_2", 8),
        _l("89_drills_recursion_1", 8),
        _l("90_drills_windows_1", 8),
        _l("91_drills_windows_2", 8),
        _l("92_drills_windows_3", 8),
        _l("93_drills_windows_4", 8),
        _l("94_drills_frames_1", 8),
        _l("95_drills_lag_lead_1", 8),
        _l("96_drills_topn_1", 8),
        _l("97_drills_pivots_1", 8),
        _l("98_drills_pivots_2", 8),
        _l("99_drills_dates_1", 8),
        _l("100_drills_dates_2", 8),
        _l("101_drills_series_1", 8),
        _l("102_drills_text_1", 8),
        _l("103_drills_regex_1", 8),
        _l("104_drills_jsonb_1", 8),
        _l("105_drills_jsonb_2", 8),
        _l("106_drills_lateral_1", 8),
        _l("107_drills_distinct_on_1", 8),
        _l("108_drills_grouping_sets_1", 8),
        _l("109_drills_reports_1", 8),
        _l("110_drills_reports_2", 8),
        _l("111_drills_reports_3", 8),
        _l("112_drills_mixed_1", 8),
        _l("113_drills_mixed_2", 8),
        _l("114_drills_mixed_3", 8),
    ]),
]


def all_lessons() -> list[LessonSpec]:
    return [spec for _, lessons in PARTS for spec in lessons]


def lesson(slug: str) -> LessonSpec | None:
    for spec in all_lessons():
        if spec.slug == slug:
            return spec
    return None
