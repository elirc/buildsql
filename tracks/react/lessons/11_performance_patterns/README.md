# 11 — Performance patterns

Here is the default behaviour, and it surprises people: **when a component
re-renders, React re-renders every component below it**, whether or not their
props changed. Not the DOM — React still only touches the parts of the document
that actually differ — but your component functions all run again, and all the
work inside them runs again with them.

That is usually fine. Rendering a function that returns some JSX is cheap, and
React is very good at the diffing that follows. It stops being fine in two
situations: when a component does something genuinely expensive during render,
and when a large subtree re-renders because of a state change that had nothing
to do with it — a keystroke in a search box redrawing a thousand-row table.

React gives you three tools for that, and this lesson is as much about when
*not* to reach for them. `memo` lets a component skip a render whose props are
unchanged. `useMemo` remembers a computed value between renders. `useCallback`
remembers a function. All three have the same shape — "keep the previous one
unless something changed" — and all three cost something: a comparison on every
render, memory, and a dependency array you now have to keep honest.

The most important idea in the lesson is exercise 4, where the fix is not
memoization at all. Moving state to where it belongs deletes the problem
outright, costs nothing, and cannot rot. Reach for structure first.

## Concept — three tools, one idea

**`memo` — skip a component.**

```tsx
const Row = memo(function Row({ product }) {
  return <li>{product.name}</li>;
});
```

`memo` returns a component that compares its new props with the old ones and
skips rendering when they are shallowly equal — each prop compared with
`Object.is`. Strings and numbers behave the way you expect. **Objects, arrays
and functions are compared by identity**, so a prop rebuilt on every render
makes `memo` a comparison that always fails, plus a wasted render. That failure
mode is exercise 2, and it is the single most common reason memo "does nothing".

**`useMemo` — remember a value.**

```tsx
const visible = useMemo(() => filterAndSort(products, filter), [products, filter]);
```

The factory runs on the first render and again whenever a dependency changes;
otherwise React hands back the value it already has. Note the shape — a function
that *returns* the value, not the value.

`useMemo` has a second job that is not about speed at all: keeping an object or
array **identity-stable** so that a memoized child, or an effect's dependency
array, sees it as unchanged. That use is a correctness tool, not an
optimisation.

**`useCallback` — remember a function.** `useCallback(fn, deps)` is exactly
`useMemo(() => fn, deps)`, with nicer syntax. It matters only when the function
is a dependency of something: a prop to a memoized child, or an entry in an
effect's dependency array (which is why it turned up in lesson 07).

**What is already stable and needs none of this:** `useState` setters,
`useReducer`'s `dispatch`, refs from `useRef`, and anything defined outside the
component.

### When not to

- **Do not memoize by default.** Every `memo` is a comparison on every render
  and a dependency array that can go stale. A wrong dependency array does not
  make things slow, it makes them *wrong* — the classic symptom is a handler
  that keeps calling yesterday's callback.
- **Measure first.** React DevTools' Profiler shows you which components
  rendered and why. "This feels slow" is not a finding.
- **Prefer structure.** Moving state down (exercise 4), lifting content up as
  `children` so it does not re-render with its parent, or splitting a component
  in two are all free and permanent.
- **React Compiler.** React now ships a compiler that inserts this memoization
  automatically, which is a strong signal about how much of it is mechanical
  bookkeeping. It does not remove the need to understand what it is doing, and
  it only works on code that follows the rules of hooks.

## Exercise 1 — `memo`

Edit `ex1/solution.tsx`. `ExpensiveRow({ label, onRender })` renders the label
in an `<li>`. Make it skip rendering when its props have not changed, while
still updating when `label` really does change.

The `onRender` probe counts renders, as in lesson 03.

```
uv run dojo test react 11_performance_patterns ex1
```

## Exercise 2 — `useCallback`

Edit `ex2/solution.tsx`. `Child` is **already memoized** and you should not
change it. `Parent` has its own click counter, and every click of `Bump`
re-renders the child even though nothing the child cares about changed.

Fix `Parent` so that clicking `Bump` three times leaves the child rendered
exactly once, and clicking `Pick` still sets the picked value.

```
uv run dojo test react 11_performance_patterns ex2
```

## Exercise 3 — `useMemo`

Edit `ex3/solution.tsx`. `Report({ rows, compute })` shows `Total: 6` and has a
`Toggle details` button. `compute` is expensive; pretend it takes 200ms.

Make it run once per distinct `rows`, not once per render.

```
uv run dojo test react 11_performance_patterns ex3
```

## Exercise 4 — the fix that is not memoization

Edit `ex4/solution.tsx`. `Dashboard` has a note field and an `ExpensiveList`
that has nothing to do with it. Every keystroke re-renders the list.

Make five keystrokes produce exactly **one** render of `ExpensiveList`, while
the note is still echoed in the live region.

`ExpensiveList` is not memoized and must stay that way — **solve this without
`memo`**. There is a structural change that removes the problem entirely, and
finding it is the exercise.

```
uv run dojo test react 11_performance_patterns ex4
```

## Challenge — the capstone

Edit `challenge/solution.tsx`. `ProductTable({ products, onRowRender })` already
works: it filters by a text box labelled `Filter`, sorts A–Z, renders each
product in an `<li>`, and reports `1 of 4 shown`.

What it does badly is re-render every visible row on every keystroke. Fix that
so a row which was on screen before the filter changed, and is still on screen
after, does not render again — without changing any visible behaviour.

Honest difficulty note: two of this lesson's three tools apply, and one of them
does not. Working out which is which is the point.

```
uv run dojo test react 11_performance_patterns challenge
```

## The gate

This is the entire gate, `gate.test.tsx`:

<!-- GATE:BEGIN -->

```tsx
// Gate for react/11_performance_patterns. Quoted verbatim in README.md.
//
// Every assertion here is a render count, taken from a spy passed in as a
// prop. No timing, no benchmarks - just "did this component render again, yes
// or no", which is the only thing memoization actually changes.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { ExpensiveRow } from "./ex1/solution";
import { Parent } from "./ex2/solution";
import { Report } from "./ex3/solution";
import { Dashboard } from "./ex4/solution";
import { ProductTable } from "./challenge/solution";

describe("11_performance_patterns", () => {
  test("ex1 - ExpensiveRow skips a re-render when its props did not change", () => {
    const onRender = vi.fn();
    const { rerender } = render(<ExpensiveRow label="Widget" onRender={onRender} />);

    expect(screen.getByRole("listitem"), "it still has to render the label").toHaveTextContent(
      "Widget",
    );
    expect(onRender, "one render on mount").toHaveBeenCalledTimes(1);

    rerender(<ExpensiveRow label="Widget" onRender={onRender} />);
    rerender(<ExpensiveRow label="Widget" onRender={onRender} />);
    expect(
      onRender,
      "the parent re-rendered but every prop is identical, so this component " +
        "had nothing new to say. Wrapping it in memo lets React skip it " +
        "(README ex1)",
    ).toHaveBeenCalledTimes(1);

    rerender(<ExpensiveRow label="Gadget" onRender={onRender} />);
    expect(
      onRender,
      "a prop that really changed must still get through - memo compares, it " +
        "does not freeze",
    ).toHaveBeenCalledTimes(2);
  });

  test("ex2 - Parent hands its memoized child a function that stays the same", async () => {
    const user = userEvent.setup();
    const onChildRender = vi.fn();
    render(<Parent onChildRender={onChildRender} />);

    expect(onChildRender, "the child renders once on mount").toHaveBeenCalledTimes(1);

    const bump = screen.getByRole("button", { name: "Bump" });
    await user.click(bump);
    await user.click(bump);
    await user.click(bump);

    expect(screen.getByRole("status"), "the parent's own counter still works").toHaveTextContent(
      "3 clicks",
    );
    expect(
      onChildRender,
      "Child is already wrapped in memo, and yet it re-rendered three times. " +
        "A function declared in the render body is a brand new object every " +
        "render, so the memo comparison always fails - reread README ex2",
    ).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Pick" }));
    expect(
      screen.getByRole("status"),
      "and the callback must still do its job when it is finally called",
    ).toHaveTextContent("picked apple");
  }, 20000);

  test("ex3 - Report recomputes only when its input changes", async () => {
    const user = userEvent.setup();
    const rows = [1, 2, 3];
    const compute = vi.fn((values: number[]) => values.reduce((a, b) => a + b, 0));

    const { rerender } = render(<Report rows={rows} compute={compute} />);

    expect(screen.getByRole("status"), "the total is shown").toHaveTextContent("Total: 6");
    expect(compute, "computed once for these rows").toHaveBeenCalledTimes(1);

    const toggle = screen.getByRole("button", { name: "Toggle details" });
    await user.click(toggle);
    await user.click(toggle);
    expect(
      compute,
      "opening and closing the details re-renders the component, and the " +
        "expensive calculation ran again each time even though rows never " +
        "changed. useMemo keeps the previous result (README ex3)",
    ).toHaveBeenCalledTimes(1);

    rerender(<Report rows={[10, 20]} compute={compute} />);
    expect(
      screen.getByRole("status"),
      "a genuinely new input must produce a new total",
    ).toHaveTextContent("Total: 30");
    expect(compute, "which means computing again - exactly once").toHaveBeenCalledTimes(2);
  }, 20000);

  test("ex4 - Dashboard keeps typing away from the expensive part", async () => {
    const user = userEvent.setup();
    const onExpensiveRender = vi.fn();
    render(<Dashboard onExpensiveRender={onExpensiveRender} />);

    expect(onExpensiveRender, "one render on mount").toHaveBeenCalledTimes(1);

    await user.type(screen.getByLabelText("Note"), "hello");

    expect(screen.getByRole("status"), "the note still has to be echoed").toHaveTextContent(
      "hello",
    );
    expect(
      onExpensiveRender,
      "five keystrokes re-rendered the expensive list five times. The list has " +
        "nothing to do with the note - move the note's state down into its own " +
        "component so that typing only re-renders that (README ex4)",
    ).toHaveBeenCalledTimes(1);
  }, 20000);

  test("challenge - ProductTable filters without re-rendering the rows that stayed", async () => {
    const user = userEvent.setup();
    const products = [
      { id: "c", name: "Cherry" },
      { id: "a", name: "Apple" },
      { id: "d", name: "Date" },
      { id: "b", name: "Banana" },
    ];
    const onRowRender = vi.fn();

    render(<ProductTable products={products} onRowRender={onRowRender} />);

    expect(
      screen.queryAllByRole("listitem").map((li) => li.textContent),
      "every product is shown, sorted by name A-Z",
    ).toEqual(["Apple", "Banana", "Cherry", "Date"]);
    expect(screen.getByRole("status"), "and the count is reported").toHaveTextContent(
      "4 of 4 shown",
    );
    expect(
      onRowRender.mock.calls.map((call) => call[0]).sort(),
      "each row rendered once, and each was told which product it is",
    ).toEqual(["a", "b", "c", "d"]);

    onRowRender.mockClear();
    await user.type(screen.getByLabelText("Filter"), "an");

    expect(
      screen.queryAllByRole("listitem").map((li) => li.textContent),
      "only Banana contains the letters an",
    ).toEqual(["Banana"]);
    expect(screen.getByRole("status"), "and the count follows").toHaveTextContent("1 of 4 shown");
    expect(
      onRowRender.mock.calls.map((call) => call[0]),
      "Banana was on screen before the filter and is still on screen now, with " +
        "the same product object - so it had no reason to render again. If it " +
        "did, either the row is not memoized or one of its props is rebuilt on " +
        "every render (README challenge)",
    ).toEqual([]);
  }, 30000);
});
```

<!-- GATE:END -->

In plain English:

- Every assertion is a **render count** from an injected spy. No timing, no
  benchmarks — memoization does not make rendering faster, it makes rendering
  *not happen*, and that is a thing you can count.
- **ex1** re-renders with identical props twice and requires the count to stay
  at one, then changes `label` and requires it to move to two.
- **ex2** clicks the parent's own button three times and requires the child's
  count to stay at one, then uses the callback to prove it still works.
- **ex3** toggles an unrelated piece of state twice and requires `compute` to
  have been called once, then changes `rows` and requires exactly one more.
- **ex4** types five characters and requires the expensive component to have
  rendered once.
- **challenge** records which rows rendered on mount, clears the spy, types two
  characters into the filter, and requires that **no** row rendered — the only
  row still on screen is `Banana`, which was there all along.

## The teaching point

The one-sentence version: **memoization is not free, and it is not the first
tool.** Before reaching for it, ask whether the state is in the right place,
whether the expensive component needs to be under this parent at all, and
whether the work is expensive in fact rather than in feeling.

When you do reach for it, the thing to get right is prop identity. `memo` on a
child whose parent passes `style={{ margin: 8 }}` or `onClick={() => save(id)}`
is worse than no memo at all: you pay for the comparison, it always fails, and
you have added a line of code that looks like an optimisation while doing
nothing. Memoization comes in matched sets — a memoized child, stable props,
and a dependency array you actually maintain — or it comes to nothing.

This is the last lesson of the main course. Next comes the interview part:
**i1_interview_concepts** is the question bank, **i2_interview_drills** the
hands-on tasks, and **i3_interview_rapidfire** the spaced repetition that keeps
the highest-frequency material from fading.
