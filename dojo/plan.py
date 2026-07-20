"""EXPLAIN JSON wrapper."""
from __future__ import annotations

from typing import Any


class Plan:
    """Wraps one EXPLAIN (FORMAT JSON) document."""

    def __init__(self, doc: dict[str, Any]):
        self.doc = doc
        self.root = doc["Plan"]

    # -- tree access ---------------------------------------------------

    def nodes(self) -> list[dict[str, Any]]:
        out: list[dict[str, Any]] = []

        def walk(node: dict[str, Any]) -> None:
            out.append(node)
            for child in node.get("Plans", []):
                walk(child)

        walk(self.root)
        return out

    def node_types(self) -> list[str]:
        return [n["Node Type"] for n in self.nodes()]

    def has_node(self, node_type: str) -> bool:
        return node_type in self.node_types()

    def uses_index(self, index_name: str) -> bool:
        return any(n.get("Index Name") == index_name for n in self.nodes())

    def index_names(self) -> list[str]:
        return [n["Index Name"] for n in self.nodes() if n.get("Index Name")]

    @property
    def execution_time_ms(self) -> float | None:
        return self.doc.get("Execution Time")

    @property
    def planning_time_ms(self) -> float | None:
        return self.doc.get("Planning Time")

    # -- rendering -----------------------------------------------------

    def render(self) -> str:
        """Indented plan tree, one node per line, most expensive node marked."""
        nodes = self.nodes()
        worst = None
        worst_excl = -1.0
        for n in nodes:
            total = n.get("Actual Total Time")
            if total is None:
                continue
            loops = n.get("Actual Loops", 1) or 1
            child_time = sum(
                (c.get("Actual Total Time") or 0) * (c.get("Actual Loops", 1) or 1)
                for c in n.get("Plans", [])
            )
            excl = total * loops - child_time
            if excl > worst_excl:
                worst_excl, worst = excl, id(n)

        lines: list[str] = []

        def describe(node: dict[str, Any]) -> str:
            label = node["Node Type"]
            rel = node.get("Relation Name")
            if rel:
                label += f" on {rel}"
            idx = node.get("Index Name")
            if idx:
                label += f" [{idx}]"
            bits = []
            rows = node.get("Actual Rows")
            if rows is not None:
                loops = node.get("Actual Loops", 1) or 1
                bits.append(f"rows={rows * loops:,}")
            elif node.get("Plan Rows") is not None:
                bits.append(f"est_rows={node['Plan Rows']:,}")
            t = node.get("Actual Total Time")
            if t is not None:
                bits.append(f"{t * (node.get('Actual Loops', 1) or 1):.1f}ms")
            if bits:
                label += "  (" + ", ".join(bits) + ")"
            if id(node) == worst and len(nodes) > 1:
                label += "   <-- most expensive"
            return label

        def walk(node: dict[str, Any], depth: int) -> None:
            lines.append("  " * depth + describe(node))
            for child in node.get("Plans", []):
                walk(child, depth + 1)

        walk(self.root, 0)
        return "\n".join(lines)


def explain(conn, query: str, params=None, analyze: bool = True,
            timing: bool = True) -> Plan:
    """timing=False keeps per-node clocks off - use it when measuring speed,
    since per-row instrumentation inflates row-heavy plans."""
    if analyze:
        opts = "ANALYZE, BUFFERS, FORMAT JSON" if timing else \
            "ANALYZE, TIMING OFF, FORMAT JSON"
    else:
        opts = "FORMAT JSON"
    cur = conn.execute(f"EXPLAIN ({opts}) {query}", params)
    (doc,) = cur.fetchone()
    return Plan(doc[0])
