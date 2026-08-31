# d21 — Memoization (drill set)

Eight problems on `memo`, `useMemo` and `useCallback` — what they compare, what
defeats them, and the one way they can make a component wrong rather than
slow. It drills `11_performance_patterns`; the sentence to have in mind is that
`memo` compares each prop with `Object.is`, so **objects, arrays and functions
are compared by identity**.

Nothing here is described, everything is measured. Injected `onRender` spies
count how often a component ran and injected work functions count how often the
expensive thing happened, so a memo that "looks right" and does nothing fails
the same way a missing one does. Leave those calls where the stubs have them.

Six of the eight are a memoized component that never skips a render. The cause
is different every time.

## Exercise 1 — the object in the JSX

Edit `ex1/solution.tsx`. `MetricBoard({ onTileRender })` renders `Ticks: <n>` in
a `role="status"` paragraph, a `Tick` button, and a memoized `MetricTile`
showing `Revenue: 1200 EUR`. Ticking must not re-render the tile.

```
uv run dojo test react d21_memoization ex1
```

## Exercise 2 — the function in the JSX

Edit `ex2/solution.tsx`. `ColumnBoard({ onFilterRender })` renders an input
labelled `Board name`, `Board: <name>`, a `role="status"` paragraph reading
`Status toggled <n> times` — `1 time` in the singular — and a memoized
`ColumnFilter` whose button reads `Toggle Status`. Typing must not re-render
the filter, and the button must still work.

```
uv run dojo test react d21_memoization ex2
```

## Exercise 3 — the array that lies

Edit `ex3/solution.tsx`. `SlugPreview({ title, onCompute })` renders the title
slugified — lower case, non-alphanumerics collapsed to `-`, no leading or
trailing `-` — in a `role="status"` paragraph. The slug follows the title, and
the work is done again only when the title actually changes.

```
uv run dojo test react d21_memoization ex3
```

## Exercise 4 — identity, not speed

Edit `ex4/solution.tsx`. `TagPanel({ tags, onTagsRender })` renders an input
labelled `Search`, `Ticks: <n>` in a `role="status"` paragraph, a `Tick`
button, and a memoized `VisibleTags` listing the tags containing the search
text. Ticking must not re-render the list; searching must.

```
uv run dojo test react d21_memoization ex4
```

## Exercise 5 — the callback that rebuilds itself

Edit `ex5/solution.tsx`. `ZoomPanel({ onControlsRender })` renders
`Zoom: <n>` in a `role="status"` paragraph and a memoized `ZoomControls` with
`Zoom in` and `Reset zoom` buttons. Zooming changes the number and must never
re-render the controls, which do not show it.

```
uv run dojo test react d21_memoization ex5
```

## Exercise 6 — the prop you did not write

Edit `ex6/solution.tsx`. `FrameBoard({ onFrameRender, onBodyRender })` renders
`Ticks: <n>` in a `role="status"` paragraph, a `Tick` button, and a memoized
`Frame` with a `Summary` heading containing a `Body` that reads
`Nothing to report`. Ticking must re-render neither the frame nor the body.

```
uv run dojo test react d21_memoization ex6
```

## Exercise 7 — one row, one render

Edit `ex7/solution.tsx`. `ChecklistRows({ items, onRowRender })` renders a
memoized row per item, each with `<label>: done` or `<label>: to do` and a
button reading `Toggle <label>`. Toggling one row must re-render that row and
no other. `onRowRender` is called with the row's id, so the gate can tell which
rendered.

```
uv run dojo test react d21_memoization ex7
```

## Exercise 8 — all three at once

Edit `ex8/solution.tsx`. `ChartPanel({ points, buildSeries, onLegendRender })`
renders `Theme: <theme>` in a `role="status"` paragraph, a `Switch theme`
button, a memoized `Legend` listing `buildSeries(points)` as buttons, and
`Picked: <label>` once one has been clicked. Switching the theme must neither
call `buildSeries` again nor re-render the legend; picking a label must not
re-render the legend either; new `points` must do both.

```
uv run dojo test react d21_memoization ex8
```

## The gate

This is the entire gate, `gate.test.tsx`:

<!-- GATE:BEGIN -->

```tsx
// Gate for react/d21_memoization. Quoted verbatim in README.md.
//
// Every exercise is measured, not described: injected onRender spies count how
// often a component ran, and injected work functions count how often the
// expensive thing happened.
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { MetricBoard } from "./ex1/solution";
import { ColumnBoard } from "./ex2/solution";
import { SlugPreview } from "./ex3/solution";
import { TagPanel } from "./ex4/solution";
import { ZoomPanel } from "./ex5/solution";
import { FrameBoard } from "./ex6/solution";
import { ChecklistRows } from "./ex7/solution";
import { ChartPanel } from "./ex8/solution";

const texts = (role: string) => screen.queryAllByRole(role).map((node) => node.textContent);

describe("d21_memoization", () => {
  test("ex1 - MetricBoard stops rebuilding a prop that never changes", () => {
    const onTileRender = vi.fn();
    render(<MetricBoard onTileRender={onTileRender} />);

    expect(screen.queryByText("Revenue: 1200 EUR"), "the tile renders its metric").not.toBeNull();
    expect(onTileRender, "once, to begin with").toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Tick" }));
    fireEvent.click(screen.getByRole("button", { name: "Tick" }));
    fireEvent.click(screen.getByRole("button", { name: "Tick" }));

    expect(screen.getByRole("status"), "the board itself did move").toHaveTextContent("Ticks: 3");
    expect(
      onTileRender,
      "and the tile did not, because nothing it is given changed. memo compares " +
        "props with Object.is, so an object written inline in the parent-s JSX " +
        "is a different object every render and the comparison can never " +
        "succeed - the memo is then pure cost (README ex1)",
    ).toHaveBeenCalledTimes(1);
  }, 30000);

  test("ex2 - ColumnBoard hands the filter the same callback every time", () => {
    const onFilterRender = vi.fn();
    render(<ColumnBoard onFilterRender={onFilterRender} />);

    expect(onFilterRender, "one render to start").toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent("Status toggled 0 times");

    fireEvent.change(screen.getByLabelText("Board name"), { target: { value: "Q" } });
    fireEvent.change(screen.getByLabelText("Board name"), { target: { value: "Q3" } });
    expect(screen.queryByText("Board: Q3"), "the board name follows the typing").not.toBeNull();
    expect(
      onFilterRender,
      "the filter takes a name and a callback, and neither of those changed - " +
        "except that a function written inline in the parent is a brand new " +
        "function on every keystroke, which is the single commonest reason memo " +
        "appears to do nothing (README ex2)",
    ).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Toggle Status" }));
    expect(screen.getByRole("status"), "and the callback still works").toHaveTextContent(
      "Status toggled 1 time",
    );
  }, 30000);

  test("ex3 - SlugPreview recomputes when the title changes", () => {
    const onCompute = vi.fn();
    const { rerender } = render(<SlugPreview title="Hello World" onCompute={onCompute} />);

    expect(screen.getByRole("status"), "the slug of the title it was given").toHaveTextContent(
      "hello-world",
    );
    expect(onCompute, "computed once").toHaveBeenCalledTimes(1);

    rerender(<SlugPreview title="Second Post" onCompute={onCompute} />);
    expect(
      screen.getByRole("status"),
      "an empty dependency array on a useMemo does not make a component fast, " +
        "it makes it wrong: the value is computed once and then shown for ever, " +
        "whatever the inputs do afterwards (README ex3)",
    ).toHaveTextContent("second-post");
    expect(onCompute, "a new title is worth the work").toHaveBeenCalledTimes(2);

    rerender(<SlugPreview title="Second Post" onCompute={onCompute} />);
    expect(
      onCompute,
      "and the same title again is not - the array has to name what the answer " +
        "really depends on, no more and no less",
    ).toHaveBeenCalledTimes(2);
  }, 30000);

  test("ex4 - TagPanel keeps a derived array stable while it stays the same", () => {
    const onTagsRender = vi.fn();
    render(<TagPanel tags={["react", "redux", "rust", "ruby"]} onTagsRender={onTagsRender} />);

    expect(texts("listitem"), "with an empty search everything shows").toEqual([
      "react",
      "redux",
      "rust",
      "ruby",
    ]);
    expect(onTagsRender, "one render").toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Tick" }));
    fireEvent.click(screen.getByRole("button", { name: "Tick" }));
    expect(screen.getByRole("status"), "the panel re-rendered twice").toHaveTextContent("Ticks: 2");
    expect(
      onTagsRender,
      "and the list of visible tags is the same list it was. filter() builds a " +
        "new array every time it runs, so a memoized child receiving that array " +
        "sees a changed prop on every render of its parent - useMemo-s second " +
        "job is keeping an identity, not saving time (README ex4)",
    ).toHaveBeenCalledTimes(1);

    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "ru" } });
    expect(texts("listitem"), "a real search really filters").toEqual(["rust", "ruby"]);
    expect(onTagsRender, "which is a change worth rendering").toHaveBeenCalledTimes(2);
  }, 30000);

  test("ex5 - ZoomPanel keeps its callback across the changes it causes", () => {
    const onControlsRender = vi.fn();
    render(<ZoomPanel onControlsRender={onControlsRender} />);

    expect(screen.getByRole("status"), "it starts at one").toHaveTextContent("Zoom: 1");
    expect(onControlsRender, "one render").toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));

    expect(screen.getByRole("status"), "three clicks in").toHaveTextContent("Zoom: 4");
    expect(
      onControlsRender,
      "the controls never show the zoom - they only change it - so nothing they " +
        "are given should have changed. A useCallback that lists the value it " +
        "is about to replace is rebuilt every time that value moves, which is " +
        "every time the callback is used (README ex5)",
    ).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Reset zoom" }));
    expect(screen.getByRole("status"), "and reset still resets").toHaveTextContent("Zoom: 1");
    expect(onControlsRender, "still one render").toHaveBeenCalledTimes(1);
  }, 30000);

  test("ex6 - FrameBoard keeps a memoized frame out of its own re-renders", () => {
    const onFrameRender = vi.fn();
    const onBodyRender = vi.fn();
    render(<FrameBoard onFrameRender={onFrameRender} onBodyRender={onBodyRender} />);

    expect(screen.queryByRole("heading", { name: "Summary" }), "the frame renders").not.toBeNull();
    expect(screen.queryByText("Nothing to report"), "with its body inside").not.toBeNull();
    expect(onFrameRender, "once each").toHaveBeenCalledTimes(1);
    expect(onBodyRender).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Tick" }));
    fireEvent.click(screen.getByRole("button", { name: "Tick" }));

    expect(screen.getByRole("status")).toHaveTextContent("Ticks: 2");
    expect(
      onFrameRender,
      "the frame is memoized and its title has not changed - but children is a " +
        "prop like any other, and the JSX written between the tags is a new " +
        "element object on every render of the parent. memo compares it with " +
        "Object.is and finds it different, every time (README ex6)",
    ).toHaveBeenCalledTimes(1);
    expect(onBodyRender, "and so the body is untouched too").toHaveBeenCalledTimes(1);
  }, 30000);

  test("ex7 - ChecklistRows re-renders the row that changed and no other", () => {
    const onRowRender = vi.fn();
    render(
      <ChecklistRows
        items={[
          { id: "a", label: "Beans" },
          { id: "b", label: "Filters" },
          { id: "c", label: "Milk" },
        ]}
        onRowRender={onRowRender}
      />,
    );

    expect(
      onRowRender.mock.calls.map((call) => call[0]),
      "three rows, one render each",
    ).toEqual(["a", "b", "c"]);

    onRowRender.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "Toggle Filters" }));

    expect(screen.queryByText("Filters: done"), "the row that was clicked changed").not.toBeNull();
    expect(screen.queryByText("Beans: to do"), "and the others did not").not.toBeNull();
    expect(
      onRowRender.mock.calls.map((call) => call[0]),
      "so exactly one row had any reason to render. Writing the handler as an " +
        "arrow inside the map gives every row a new function on every render of " +
        "the list, and every memoized row is then a comparison that always " +
        "fails (README ex7)",
    ).toEqual(["b"]);

    onRowRender.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "Toggle Milk" }));
    expect(screen.queryByText("Milk: done")).not.toBeNull();
    expect(onRowRender.mock.calls.map((call) => call[0]), "and again").toEqual(["c"]);
  }, 30000);

  test("ex8 - ChartPanel does none of its work twice", () => {
    const buildSeries = vi.fn((points: number[]) => points.map((point) => `p${point}`));
    const onLegendRender = vi.fn();
    const first = [1, 2, 3];

    const { rerender } = render(
      <ChartPanel points={first} buildSeries={buildSeries} onLegendRender={onLegendRender} />,
    );

    expect(texts("listitem"), "the legend lists the series").toEqual(["p1", "p2", "p3"]);
    expect(screen.getByRole("status"), "and the theme is on show").toHaveTextContent("Theme: light");
    expect(buildSeries, "built once").toHaveBeenCalledTimes(1);
    expect(onLegendRender, "rendered once").toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Switch theme" }));
    fireEvent.click(screen.getByRole("button", { name: "Switch theme" }));

    expect(screen.getByRole("status"), "the theme really does switch").toHaveTextContent(
      "Theme: light",
    );
    expect(
      buildSeries,
      "a theme is not a data set. Every piece of derived work needs a dependency " +
        "array naming the inputs it actually reads, or a change to anything at " +
        "all redoes all of it (README ex8)",
    ).toHaveBeenCalledTimes(1);
    expect(
      onLegendRender,
      "and the legend takes a series and a callback, neither of which a theme " +
        "can change",
    ).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "p2" }));
    expect(screen.queryByText("Picked: p2"), "picking from the legend works").not.toBeNull();
    expect(onLegendRender, "and does not redraw the legend").toHaveBeenCalledTimes(1);

    rerender(
      <ChartPanel points={[4, 5]} buildSeries={buildSeries} onLegendRender={onLegendRender} />,
    );
    expect(texts("listitem"), "new points really are new work").toEqual(["p4", "p5"]);
    expect(buildSeries, "so the series is built again").toHaveBeenCalledTimes(2);
    expect(onLegendRender, "and the legend has something new to draw").toHaveBeenCalledTimes(2);
  }, 30000);
});
```

<!-- GATE:END -->

Next: **d22_render_performance**, where the fix is not memoization at all.
