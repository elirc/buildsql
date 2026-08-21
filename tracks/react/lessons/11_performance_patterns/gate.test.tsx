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
