# d19 — Custom hooks, part 1 (drill set)

Eight problems on writing a hook other people can use. It drills
`10_custom_hooks`, and the sentence that lesson opens with is the one to hold
on to: extracting a hook moves lines, it does not move state — the state still
belongs to whichever component called the hook.

Everything here is about the **shape of what a hook hands back**. Values that
should be derived rather than stored, functions that must be the same object
next render, an API object that must not be rebuilt for nothing, and work that
should not run again just because the component redrew. Two of the eight are
about the rules rather than the shape.

Where a hook's return value is the whole API, the gate drives it with
`renderHook`. Where a hook only makes sense wired to markup, the gate writes its
own little component and asserts on the accessible DOM.

## Exercise 1 — the same functions next render

Edit `ex1/solution.tsx`. `useCarousel(count)` returns
`{ index, next, prev, atStart, atEnd }`. `next` and `prev` move the index one
place and stop at both ends; `atStart` and `atEnd` say where it is. The gate
holds on to `next` and `prev` and checks they are still the same function
objects several renders later.

```
uv run dojo test react d19_custom_hooks_1 ex1
```

## Exercise 2 — edited, and un-edited

Edit `ex2/solution.tsx`. `useTextField(initial)` returns
`{ value, onChange, dirty, reset }`, where `onChange` goes straight onto an
`<input>` and `reset` puts `initial` back. `dirty` is true exactly when the
current value differs from the one the field started with — so typing something
and typing it back leaves it false.

```
uv run dojo test react d19_custom_hooks_1 ex2
```

## Exercise 3 — one tally each

Edit `ex3/solution.tsx`. `useTally()` returns `{ count, add }`. The gate puts
two components using it on screen at once and adds to one of them; the other
must not move.

```
uv run dojo test react d19_custom_hooks_1 ex3
```

## Exercise 4 — a hook in a loop

Edit `ex4/solution.tsx`. `PriceRows({ rows })` renders a `<ul>` with one `<li>`
per row containing `<label>: marked` or `<label>: unmarked` and a button reading
`Mark <label>` that marks that row. The gate marks a row and then rerenders with
a **shorter** list, which the stub does not survive. A row's mark stays with its
row.

```
uv run dojo test react d19_custom_hooks_1 ex4
```

## Exercise 5 — a timer that stops

Edit `ex5/solution.tsx`. `useCountdown(from)` returns
`{ remaining, running, start, pause, reset }`. It counts down one per second
only while it is running, stops at `0`, and leaves **no timer running** once it
has finished, once it is paused, or once the component has gone.

```
uv run dojo test react d19_custom_hooks_1 ex5
```

## Exercise 6 — filter when the question changes

Edit `ex6/solution.tsx`. `useFilteredList(items, query, onFilter)` returns
`{ matches, count }`, where `matches` are the items containing `query`,
case-insensitively. The filtering pass — including the `onFilter()` call, which
you should leave where it is — must run only when `items` or `query` change,
not on every render of the component that called the hook.

```
uv run dojo test react d19_custom_hooks_1 ex6
```

## Exercise 7 — one API object

Edit `ex7/solution.tsx`. `useCollection(initial)` returns
`{ items, add, remove, clear }`. The three functions must be the same objects
for the whole life of the hook, and the object holding them must be the same
object until `items` actually changes — which removing something that was never
there does not do.

```
uv run dojo test react d19_custom_hooks_1 ex7
```

## Exercise 8 — errors that cannot go stale

Edit `ex8/solution.tsx`. `useForm(initial, validate)` returns
`{ values, errors, isValid, setField, reset }`. `errors` is whatever
`validate(values)` says about the values as they are now, `isValid` is true when
there are none, `setField(name, value)` changes one field and `reset()` goes back
to the values the form started with. `validate` must not be called again on a
render where nothing changed.

```
uv run dojo test react d19_custom_hooks_1 ex8
```

## The gate

This is the entire gate, `gate.test.tsx`:

<!-- GATE:BEGIN -->

```tsx
// Gate for react/d19_custom_hooks_1. Quoted verbatim in README.md.
//
// Where the hook's return value IS the API, the gate drives it with
// renderHook. Where the hook only makes sense attached to markup, the gate
// defines its own little component and asserts on the accessible DOM.
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { useState, type ChangeEvent } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { useCarousel } from "./ex1/solution";
import { useTextField } from "./ex2/solution";
import { useTally } from "./ex3/solution";
import { PriceRows } from "./ex4/solution";
import { useCountdown } from "./ex5/solution";
import { useFilteredList } from "./ex6/solution";
import { useCollection } from "./ex7/solution";
import { useForm } from "./ex8/solution";

const texts = (role: string) => screen.queryAllByRole(role).map((node) => node.textContent);

afterEach(() => {
  vi.useRealTimers();
});

describe("d19_custom_hooks_1", () => {
  test("ex1 - useCarousel hands back the same functions every render", () => {
    const { result } = renderHook(() => useCarousel(3));

    expect(result.current.index, "it starts at the beginning").toBe(0);
    expect(result.current.atStart, "and says so").toBe(true);
    expect(result.current.atEnd).toBe(false);

    const next = result.current.next;
    const prev = result.current.prev;

    act(() => result.current.next());
    expect(result.current.index, "next moves one along").toBe(1);
    expect(
      result.current.next,
      "and it is still the same function object. A function built fresh in the " +
        "hook body is a new value every render, so a consumer who puts it in a " +
        "dependency array re-runs their effect for ever, and a memoized child " +
        "taking it as a prop is never skipped (README ex1)",
    ).toBe(next);
    expect(result.current.prev, "both of them").toBe(prev);

    act(() => result.current.next());
    expect(result.current.index).toBe(2);
    expect(result.current.atEnd, "three slides means the last one is index two").toBe(true);

    act(() => result.current.next());
    expect(result.current.index, "and there is nothing past the end").toBe(2);

    act(() => result.current.prev());
    act(() => result.current.prev());
    expect(result.current.index).toBe(0);
    act(() => result.current.prev());
    expect(result.current.index, "nor before the beginning").toBe(0);
    expect(result.current.next, "and still the same functions at the end of it").toBe(next);
  }, 30000);

  test("ex2 - useTextField knows when it has been edited and when it has not", () => {
    function Nickname({ initial }: { initial: string }) {
      const { value, onChange, dirty, reset } = useTextField(initial);
      return (
        <>
          <label htmlFor="nickname">Nickname</label>
          <input id="nickname" value={value} onChange={onChange} />
          <p role="status">{dirty ? "Edited" : "Unchanged"}</p>
          <button type="button" onClick={reset}>
            Reset
          </button>
        </>
      );
    }

    render(<Nickname initial="ada" />);
    const box = screen.getByLabelText("Nickname");

    expect(box, "the hook starts at the value it was given").toHaveValue("ada");
    expect(screen.getByRole("status"), "and nothing has been edited").toHaveTextContent("Unchanged");

    fireEvent.change(box, { target: { value: "ada!" } });
    expect(box, "the hook owns the value the input shows").toHaveValue("ada!");
    expect(screen.getByRole("status"), "and now it has been edited").toHaveTextContent("Edited");

    fireEvent.change(box, { target: { value: "ada" } });
    expect(
      screen.getByRole("status"),
      "typed back to exactly what it started as, this field has not been edited " +
        "after all. A dirty flag kept in state has to be un-set by hand and " +
        "never is; a dirty flag compared against the original cannot be wrong " +
        "(README ex2)",
    ).toHaveTextContent("Unchanged");

    fireEvent.change(box, { target: { value: "lovelace" } });
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(box, "reset puts the original back").toHaveValue("ada");
    expect(screen.getByRole("status"), "which is not an edit either").toHaveTextContent("Unchanged");
  }, 30000);

  test("ex3 - two components calling useTally do not share a tally", () => {
    function Tally({ label }: { label: string }) {
      const { count, add } = useTally();
      return (
        <>
          <p role="status">
            {label}: {count}
          </p>
          <button type="button" onClick={add}>
            Add {label}
          </button>
        </>
      );
    }

    render(
      <>
        <Tally label="Left" />
        <Tally label="Right" />
      </>,
    );

    expect(texts("status"), "both start at nothing").toEqual(["Left: 0", "Right: 0"]);

    fireEvent.click(screen.getByRole("button", { name: "Add Left" }));
    fireEvent.click(screen.getByRole("button", { name: "Add Left" }));
    expect(
      texts("status"),
      "a hook is not a place where state lives - it is a recipe for calling " +
        "useState, and each component that follows it gets its own slot. Keep " +
        "the value in a variable at module scope and every caller shares one, " +
        "which is a bug you cannot see until the second one appears " +
        "(README ex3)",
    ).toEqual(["Left: 2", "Right: 0"]);

    fireEvent.click(screen.getByRole("button", { name: "Add Right" }));
    expect(texts("status"), "and the other counts on its own too").toEqual(["Left: 2", "Right: 1"]);
  }, 30000);

  test("ex4 - PriceRows survives the list getting shorter", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const rows = [
      { id: "beans", label: "Beans" },
      { id: "mugs", label: "Mugs" },
      { id: "filters", label: "Filters" },
    ];

    const { rerender } = render(<PriceRows rows={rows} />);
    expect(screen.queryAllByRole("listitem").length, "one row each").toBe(3);
    expect(screen.queryByText("Beans: unmarked"), "and none of them marked").not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Mark Beans" }));
    expect(screen.queryByText("Beans: marked"), "marking one marks that one").not.toBeNull();
    expect(screen.queryByText("Mugs: unmarked"), "and only that one").not.toBeNull();

    rerender(<PriceRows rows={rows.slice(0, 2)} />);

    expect(
      screen.queryAllByRole("listitem").length,
      "React matches hooks to their state by call order, so a component that " +
        "calls useState once per row calls it a different number of times when " +
        "the list gets shorter - and React throws. State that belongs to a row " +
        "belongs to a component that is one row (README ex4)",
    ).toBe(2);
    expect(screen.queryByText("Beans: marked"), "and the mark stays with its row").not.toBeNull();

    errors.mockRestore();
  }, 30000);

  test("ex5 - useCountdown stops when told and stops when it is over", () => {
    vi.useFakeTimers();
    const { result, unmount } = renderHook(() => useCountdown(3));

    expect(result.current.remaining, "it starts where it was told to").toBe(3);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.remaining, "and does not start counting on its own").toBe(3);

    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.remaining, "two seconds is two seconds").toBe(1);

    act(() => result.current.pause());
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(
      result.current.remaining,
      "pausing has to stop the interval, not just stop looking at it. An effect " +
        "that starts a timer and returns no cleanup leaves it running for the " +
        "life of the page (README ex5)",
    ).toBe(1);

    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remaining, "resuming spends the last second").toBe(0);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.remaining, "and zero is the bottom").toBe(0);
    expect(
      vi.getTimerCount(),
      "a countdown that has finished has nothing left to count, so it should " +
        "not still be ticking",
    ).toBe(0);

    act(() => result.current.reset());
    expect(result.current.remaining, "reset goes back to the start").toBe(3);

    act(() => result.current.start());
    unmount();
    expect(vi.getTimerCount(), "and leaving the page stops it too").toBe(0);
  }, 30000);

  test("ex6 - useFilteredList filters when the question changes, not when the page redraws", () => {
    const onFilter = vi.fn();

    function Catalogue({ items, query }: { items: string[]; query: string }) {
      const { matches, count } = useFilteredList(items, query, onFilter);
      const [ticks, setTicks] = useState(0);
      return (
        <>
          <p role="status">
            {count} of {items.length} - {ticks}
          </p>
          <ul>
            {matches.map((match) => (
              <li key={match}>{match}</li>
            ))}
          </ul>
          <button type="button" onClick={() => setTicks((current) => current + 1)}>
            Tick
          </button>
        </>
      );
    }

    const items = ["Espresso", "Filter coffee", "Cold brew", "Filter papers"];
    const { rerender } = render(<Catalogue items={items} query="filter" />);

    expect(texts("listitem"), "the matches are the ones that contain the query").toEqual([
      "Filter coffee",
      "Filter papers",
    ]);
    expect(screen.getByRole("status")).toHaveTextContent("2 of 4 - 0");
    expect(onFilter, "one question, one pass over the list").toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Tick" }));
    expect(screen.getByRole("status"), "the component re-rendered").toHaveTextContent("2 of 4 - 1");
    expect(
      onFilter,
      "but nothing it filters on changed. Work done in the hook body runs on " +
        "every render of every component that calls the hook, whatever the " +
        "render was for - useMemo is what says which inputs the answer really " +
        "depends on (README ex6)",
    ).toHaveBeenCalledTimes(1);

    rerender(<Catalogue items={items} query="brew" />);
    expect(texts("listitem"), "a new question is a new answer").toEqual(["Cold brew"]);
    expect(onFilter, "and that one is worth the work").toHaveBeenCalledTimes(2);
  }, 30000);

  test("ex7 - useCollection returns one API object, not a new one every render", () => {
    const { result, rerender } = renderHook(() => useCollection(["alpha"]));

    const api = result.current;
    expect(api.items, "it starts from what it was given").toEqual(["alpha"]);

    rerender();
    expect(
      result.current,
      "nothing changed, so the thing handed back should be the thing handed " +
        "back last time. A hook that builds a fresh object every render gives " +
        "every consumer a changed value on every render, which defeats memo, " +
        "dependency arrays and everything built on them (README ex7)",
    ).toBe(api);

    act(() => result.current.add("bravo"));
    expect(result.current.items, "adding adds").toEqual(["alpha", "bravo"]);
    expect(result.current, "and that really is a change, so this is a new object").not.toBe(api);
    expect(result.current.add, "but the functions inside it never change").toBe(api.add);
    expect(result.current.remove).toBe(api.remove);
    expect(result.current.clear).toBe(api.clear);

    act(() => result.current.remove("alpha"));
    expect(result.current.items, "removing removes").toEqual(["bravo"]);

    const before = result.current;
    act(() => result.current.remove("nothing at all"));
    expect(
      result.current,
      "removing something that was never there changes nothing, so nothing " +
        "should look changed",
    ).toBe(before);

    act(() => result.current.clear());
    expect(result.current.items, "and clear clears").toEqual([]);
  }, 30000);

  test("ex8 - useForm works its errors out from the values it holds", () => {
    const validate = vi.fn((values: Record<string, string>) => {
      const errors: Record<string, string> = {};
      if (!values.email.includes("@")) errors.email = "Email needs an @";
      if (values.password.length < 8) errors.password = "Password is too short";
      return errors;
    });

    const { result, rerender } = renderHook(() =>
      useForm({ email: "", password: "" }, validate),
    );

    expect(result.current.errors, "an empty form is wrong in two ways").toEqual({
      email: "Email needs an @",
      password: "Password is too short",
    });
    expect(result.current.isValid, "and so it is not valid").toBe(false);

    act(() => result.current.setField("email", "ada@example.com"));
    expect(
      result.current.errors,
      "fixing a field fixes its error, without anything having to remember to " +
        "clear it. Errors kept in state have to be re-computed by hand after " +
        "every change, and the one place that forgets is the bug (README ex8)",
    ).toEqual({ password: "Password is too short" });
    expect(result.current.values.email, "and the value is kept").toBe("ada@example.com");

    act(() => result.current.setField("password", "hunter2!!"));
    expect(result.current.errors, "a form with nothing wrong has no errors").toEqual({});
    expect(result.current.isValid, "which is what valid means").toBe(true);

    const so_far = validate.mock.calls.length;
    rerender();
    expect(
      validate,
      "re-rendering for some other reason does not change any value, so there " +
        "is nothing new to check",
    ).toHaveBeenCalledTimes(so_far);

    act(() => result.current.reset());
    expect(result.current.values, "reset goes back to the beginning").toEqual({
      email: "",
      password: "",
    });
    expect(result.current.isValid, "which was not valid").toBe(false);
  }, 30000);
});
```

<!-- GATE:END -->

Next: **d20_custom_hooks_2**, where hooks talk to the outside world and to each
other.
