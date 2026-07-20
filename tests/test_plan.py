from dojo.plan import Plan


def test_flatten_and_types(canned_plan):
    p = Plan(canned_plan)
    assert len(p.nodes()) == 5
    assert p.node_types() == ["Sort", "Hash Join", "Seq Scan", "Hash", "Index Scan"]
    assert p.has_node("Seq Scan")
    assert not p.has_node("Bitmap Heap Scan")


def test_uses_index(canned_plan):
    p = Plan(canned_plan)
    assert p.uses_index("customers_pkey")
    assert not p.uses_index("nonexistent_idx")
    assert p.index_names() == ["customers_pkey"]


def test_times(canned_plan):
    p = Plan(canned_plan)
    assert p.execution_time_ms == 251.0
    assert p.planning_time_ms == 0.5


def test_render_tree_shape(canned_plan):
    p = Plan(canned_plan)
    out = p.render()
    lines = out.splitlines()
    assert lines[0].startswith("Sort")
    assert lines[1].startswith("  Hash Join")
    assert lines[2].startswith("    Seq Scan on orders")
    # the Seq Scan dominates exclusive time and gets the marker
    assert "<-- most expensive" in lines[2]
    assert "rows=500,000" in lines[2]
