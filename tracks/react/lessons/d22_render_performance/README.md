# d22 — Render performance without memo (drill set)

Eight problems where the answer is to move something rather than to remember
something. It drills the part of `11_performance_patterns` that is easiest to
skip past: **prefer structure**. Moving state down, passing content as
children, and not rendering what nobody is looking at are all free, permanent,
and cannot go stale the way a dependency array can.

Measured exactly as the last set was, with injected `onRender` spies — leave
those calls where the stubs have them. Seven of the eight are solved without
`memo`, `useMemo` or `useCallback` appearing anywhere; the last one needs all
three, which is the point of putting it last.

## Exercise 1 — content from above

Edit `ex1/solution.tsx`. `TickerPage({ onPanelRender })` renders a ticker with
`Ticks: <n>` in a `role="status"` paragraph and a `Tick` button, plus a panel
reading `Panel contents`. Ticking must not re-render the panel — and no
memoization of any kind may be involved.

```
uv run dojo test react d22_render_performance ex1
```

## Exercise 2 — state that belongs lower

Edit `ex2/solution.tsx`. `HelpPanel({ onBodyRender })` renders a button reading
`Show help` or `Hide help`, the paragraph `Read the manual` while help is
showing, and a report reading `Quarterly report`. Opening and closing the help
must never re-render the report.

```
uv run dojo test react d22_render_performance ex2
```

## Exercise 3 — do not build what is not shown

Edit `ex3/solution.tsx`. `ExpandableRows({ rows, onBodyRender })` renders one
`<li>` per row with a button reading `Open <label>` or `Close <label>`, and —
only while that row is open — a body reading `<label> details`. A closed row's
body must never be built at all.

```
uv run dojo test react d22_render_performance ex3
```

## Exercise 4 — a window on a long list

Edit `ex4/solution.tsx`. `WindowedRows({ items, windowSize, onRowRender })`
renders the first `windowSize` items as `<li>`s, a `role="status"` paragraph
reading `Showing <n> of <total>`, and a `Show more` button that reveals another
`windowSize` of them. Rows nobody can see are not rendered.

```
uv run dojo test react d22_render_performance ex4
```

## Exercise 5 — the change that is not one

Edit `ex5/solution.tsx`. `SelectionBar({ options, onRender })` renders
`Selected: <option>` in a `role="status"` paragraph, starting at the first
option, and a `Pick <option>` button for each. Picking the option that is
already selected must not re-render the component at all.

```
uv run dojo test react d22_render_performance ex5
```

## Exercise 6 — right on the first render

Edit `ex6/solution.tsx`. `SessionPanel({ readToken, onRender })` renders
`Session <token>` in a `role="status"` paragraph, where the token comes from
`readToken()`. Mounting the panel must produce exactly **one** render, with the
token already in it, and must call `readToken` once.

```
uv run dojo test react d22_render_performance ex6
```

## Exercise 7 — a shell with nothing to render

Edit `ex7/solution.tsx`. `DashboardShell({ onLeftRender, onRightRender })`
renders `Ticks: <n>` in a `role="status"` paragraph with a `Tick` button, an
input labelled `Search` with `Searching for <text>` beside it, and two panels
reading `Left panel` and `Right panel`. Ticking and typing must leave both
panels alone.

```
uv run dojo test react d22_render_performance ex7
```

## Exercise 8 — the table

Edit `ex8/solution.tsx`. `SortableTable({ rows, onSort, onRowRender })` renders
an input labelled `Filter`, a `Sort by name` button that flips the direction,
and one `<li>` per visible row containing the name — with ` *` appended once it
is starred — and a button reading `Star <name>`. Rows are sorted by name and
then filtered by the query. Typing must not re-sort, starring must not re-sort,
and starring one row must re-render that row only.

```
uv run dojo test react d22_render_performance ex8
```

## The gate

This is the entire gate, `gate.test.tsx`:

<!-- GATE:BEGIN -->

```tsx
// Gate for react/d22_render_performance. Quoted verbatim in README.md.
//
// Same measuring instruments as the previous set - injected onRender spies -
// and almost none of the answers are memo. Most of these are fixed by moving
// something rather than by remembering something.
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { TickerPage } from "./ex1/solution";
import { HelpPanel } from "./ex2/solution";
import { ExpandableRows } from "./ex3/solution";
import { WindowedRows } from "./ex4/solution";
import { SelectionBar } from "./ex5/solution";
import { SessionPanel } from "./ex6/solution";
import { DashboardShell } from "./ex7/solution";
import { SortableTable } from "./ex8/solution";

const texts = (role: string) => screen.queryAllByRole(role).map((node) => node.textContent);

describe("d22_render_performance", () => {
  test("ex1 - TickerPage keeps the panel out of the ticker s renders", () => {
    const onPanelRender = vi.fn();
    render(<TickerPage onPanelRender={onPanelRender} />);

    expect(screen.queryByText("Panel contents"), "the panel is on screen").not.toBeNull();
    expect(onPanelRender, "rendered once").toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Tick" }));
    fireEvent.click(screen.getByRole("button", { name: "Tick" }));
    fireEvent.click(screen.getByRole("button", { name: "Tick" }));

    expect(screen.getByRole("status"), "the ticker ticks").toHaveTextContent("Ticks: 3");
    expect(
      onPanelRender,
      "and the panel has nothing to do with any of it. A component that renders " +
        "the panel itself re-renders it every time its own state moves - a " +
        "component that receives the panel as children gets the same element " +
        "object back each render, and React skips that subtree entirely. No " +
        "memo required (README ex1)",
    ).toHaveBeenCalledTimes(1);
  }, 30000);

  test("ex2 - HelpPanel keeps the report out of a help toggle", () => {
    const onBodyRender = vi.fn();
    render(<HelpPanel onBodyRender={onBodyRender} />);

    expect(screen.queryByText("Quarterly report"), "the report is there").not.toBeNull();
    expect(screen.queryByText("Read the manual"), "and the help is not").toBeNull();
    expect(onBodyRender, "one render").toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Show help" }));
    expect(screen.queryByText("Read the manual"), "the help opens").not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Hide help" }));
    expect(screen.queryByText("Read the manual"), "and closes").toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Show help" }));

    expect(
      onBodyRender,
      "the report never changed, and it re-rendered three times, because the " +
        "flag deciding whether a paragraph shows was kept in the component " +
        "above it. State belongs to the smallest component that needs it - move " +
        "it down and the problem is gone rather than optimised (README ex2)",
    ).toHaveBeenCalledTimes(1);
  }, 30000);

  test("ex3 - ExpandableRows does not build a body nobody has opened", () => {
    const onBodyRender = vi.fn();
    render(
      <ExpandableRows
        rows={[
          { id: "beans", label: "Beans" },
          { id: "mugs", label: "Mugs" },
          { id: "filters", label: "Filters" },
        ]}
        onBodyRender={onBodyRender}
      />,
    );

    expect(
      onBodyRender,
      "three closed rows, and not one body has any reason to exist yet. " +
        "Rendering them all and hiding two is work done for nobody - and on a " +
        "real page it is three times the DOM and three times the data fetching " +
        "(README ex3)",
    ).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Open Beans" }));
    expect(screen.queryByText("Beans details"), "opening one shows its body").not.toBeNull();
    expect(
      onBodyRender.mock.calls.map((call) => call[0]),
      "and builds exactly that one",
    ).toEqual(["beans"]);

    fireEvent.click(screen.getByRole("button", { name: "Open Mugs" }));
    expect(onBodyRender.mock.calls.map((call) => call[0]), "then the next").toEqual([
      "beans",
      "mugs",
    ]);

    onBodyRender.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "Close Beans" }));
    expect(screen.queryByText("Beans details"), "closing takes the body away").toBeNull();
    expect(screen.queryByText("Mugs details"), "and leaves the other alone").not.toBeNull();
    expect(onBodyRender.mock.calls.map((call) => call[0]), "closing builds nothing").toEqual([]);
  }, 30000);

  test("ex4 - WindowedRows renders the rows somebody can see", () => {
    const onRowRender = vi.fn();
    const items = Array.from({ length: 100 }, (_, index) => `Item ${index + 1}`);

    render(<WindowedRows items={items} windowSize={5} onRowRender={onRowRender} />);

    expect(
      screen.queryAllByRole("listitem").length,
      "a hundred items, five on screen. Rendering all of them because the array " +
        "has all of them is the commonest reason a long list is slow, and no " +
        "amount of memo helps - the work is the rendering itself (README ex4)",
    ).toBe(5);
    expect(onRowRender, "five rows built").toHaveBeenCalledTimes(5);
    expect(texts("listitem").slice(0, 2), "the first five, in order").toEqual([
      "Item 1",
      "Item 2",
    ]);
    expect(screen.queryByText("Item 100"), "and nothing from the far end").toBeNull();
    expect(screen.getByRole("status"), "with a count of what is shown").toHaveTextContent(
      "Showing 5 of 100",
    );

    onRowRender.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "Show more" }));
    expect(screen.queryAllByRole("listitem").length, "five more").toBe(10);
    expect(screen.getByRole("status")).toHaveTextContent("Showing 10 of 100");
    expect(screen.queryByText("Item 10"), "and they are the next five").not.toBeNull();
  }, 30000);

  test("ex5 - SelectionBar does not re-render for a choice already made", () => {
    const onRender = vi.fn();
    render(<SelectionBar options={["Beans", "Mugs", "Filters"]} onRender={onRender} />);

    expect(screen.getByRole("status"), "it starts on the first option").toHaveTextContent(
      "Selected: Beans",
    );
    expect(onRender, "one render").toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Pick Beans" }));
    expect(
      onRender,
      "picking what is already picked changes nothing, and React knows how to " +
        "do nothing about it: setting state to the value it already holds is " +
        "not a change. Wrapping the choice in a fresh object makes every " +
        "comparison fail and every click a render (README ex5)",
    ).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Pick Filters" }));
    expect(screen.getByRole("status"), "a real change is a real change").toHaveTextContent(
      "Selected: Filters",
    );
    expect(onRender, "and one more render").toHaveBeenCalledTimes(2);
  }, 30000);

  test("ex6 - SessionPanel knows its token on the first render", () => {
    const onRender = vi.fn();
    const readToken = vi.fn(() => "abc123");

    render(<SessionPanel readToken={readToken} onRender={onRender} />);

    expect(
      screen.getByRole("status"),
      "the token was available before the first render, so there is no moment " +
        "at which the answer is No session",
    ).toHaveTextContent("Session abc123");
    expect(
      onRender,
      "and there is no second render either. Starting at null and filling it in " +
        "from an effect costs a render and commits a frame showing the empty " +
        "state - useState takes a function for exactly this (README ex6)",
    ).toHaveBeenCalledTimes(1);
    expect(readToken, "and the token is read once").toHaveBeenCalledTimes(1);
  }, 30000);

  test("ex7 - DashboardShell has nothing left to re-render", () => {
    const onLeftRender = vi.fn();
    const onRightRender = vi.fn();
    render(<DashboardShell onLeftRender={onLeftRender} onRightRender={onRightRender} />);

    expect(screen.queryByText("Left panel"), "both panels are there").not.toBeNull();
    expect(screen.queryByText("Right panel")).not.toBeNull();
    expect(onLeftRender, "one render each").toHaveBeenCalledTimes(1);
    expect(onRightRender).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Tick" }));
    fireEvent.click(screen.getByRole("button", { name: "Tick" }));
    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "co" } });
    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "cof" } });

    expect(screen.getByRole("status"), "the counter counted").toHaveTextContent("Ticks: 2");
    expect(screen.queryByText("Searching for cof"), "and the search box works").not.toBeNull();
    expect(
      onLeftRender,
      "two pieces of state, two components that should own them, and a shell " +
        "with none of its own left. A parent that holds state re-renders " +
        "everything it renders - the fix is not to make the children cheaper " +
        "but to stop the parent having a reason to render (README ex7)",
    ).toHaveBeenCalledTimes(1);
    expect(onRightRender, "the same for the other one").toHaveBeenCalledTimes(1);
  }, 30000);

  test("ex8 - SortableTable does each piece of work only when it has to", () => {
    const onSort = vi.fn();
    const onRowRender = vi.fn();
    const rows = [
      { id: "c", name: "Cold brew" },
      { id: "a", name: "Americano" },
      { id: "b", name: "Bicerin" },
    ];

    render(<SortableTable rows={rows} onSort={onSort} onRowRender={onRowRender} />);

    const order = () =>
      screen.queryAllByRole("button", { name: /^Star / }).map((node) => node.textContent);

    expect(order(), "sorted A to Z to begin with").toEqual([
      "Star Americano",
      "Star Bicerin",
      "Star Cold brew",
    ]);
    expect(onSort, "sorted once").toHaveBeenCalledTimes(1);
    expect(onRowRender.mock.calls.map((call) => call[0]), "three rows built").toEqual([
      "a",
      "b",
      "c",
    ]);

    onRowRender.mockClear();
    fireEvent.change(screen.getByLabelText("Filter"), { target: { value: "co" } });
    expect(order(), "filtering narrows the list").toEqual(["Star Cold brew"]);
    expect(
      onSort,
      "and the order of the rows has not changed, so there was nothing to sort " +
        "again - each derived step needs its own dependencies (README ex8)",
    ).toHaveBeenCalledTimes(1);

    fireEvent.change(screen.getByLabelText("Filter"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Sort by name" }));
    expect(order(), "sorting the other way really does re-sort").toEqual([
      "Star Cold brew",
      "Star Bicerin",
      "Star Americano",
    ]);
    expect(onSort).toHaveBeenCalledTimes(2);

    onRowRender.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "Star Bicerin" }));
    expect(screen.queryByText("Bicerin *"), "the starred row shows its star").not.toBeNull();
    expect(
      onRowRender.mock.calls.map((call) => call[0]),
      "and it is the only row anything happened to",
    ).toEqual(["b"]);
    expect(onSort, "starring is not sorting").toHaveBeenCalledTimes(2);
  }, 30000);
});
```

<!-- GATE:END -->

Next: **d23_component_patterns**, where the subject is the shape of the API a
component offers rather than the number of times it runs.
