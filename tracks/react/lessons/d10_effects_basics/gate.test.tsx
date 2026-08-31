// Gate for react/d10_effects_basics. Quoted verbatim in README.md.
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { RoomJoiner } from "./ex1/solution";
import { SavedIndicator } from "./ex2/solution";
import { LiveTotal } from "./ex3/solution";
import { FilterSync } from "./ex4/solution";
import { PurchaseButton } from "./ex5/solution";
import { Loader } from "./ex6/solution";
import { ProductPicker } from "./ex7/solution";
import { ChartSync } from "./ex8/solution";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

async function settle(promise: Promise<unknown>, action: () => void) {
  await act(async () => {
    action();
    await promise.catch(() => undefined);
  });
}

describe("d10_effects_basics", () => {
  test("ex1 - RoomJoiner joins once per room, not once per render", () => {
    const join = vi.fn();
    const { rerender } = render(<RoomJoiner roomId="general" label="General chat" join={join} />);

    expect(
      join,
      "an effect runs after the first render, and joining the room it was " +
        "mounted with is this one thing this component owes the outside world " +
        "(README ex1)",
    ).toHaveBeenCalledTimes(1);
    expect(join, "and it joins the room it was actually given").toHaveBeenLastCalledWith("general");
    expect(screen.queryByText("In room general"), "the room is on screen too").not.toBeNull();

    rerender(<RoomJoiner roomId="general" label="General chatter" join={join} />);
    expect(screen.queryByText("General chatter"), "the new label renders").not.toBeNull();
    expect(
      join,
      "the label changed and the room did not. An effect with no dependency " +
        "array re-runs after every single render, and rejoining a room you are " +
        "already in is a real bug - list what the effect reads",
    ).toHaveBeenCalledTimes(1);

    rerender(<RoomJoiner roomId="random" label="General chatter" join={join} />);
    expect(join, "a different room does have to be joined").toHaveBeenCalledTimes(2);
    expect(join, "with the new room id").toHaveBeenLastCalledWith("random");
  });

  test("ex2 - SavedIndicator saves a change but not the first render", () => {
    const save = vi.fn();
    const { rerender } = render(<SavedIndicator value="draft one" save={save} />);

    expect(
      save,
      "nothing has changed yet, so nothing is saved. An effect runs after the " +
        "first render whether you want it to or not - this one has to know it " +
        "is the first (README ex2)",
    ).not.toHaveBeenCalled();
    expect(
      screen.getByRole("status"),
      "and the live region says so, with: Nothing saved yet",
    ).toHaveTextContent("Nothing saved yet");

    rerender(<SavedIndicator value="draft two" save={save} />);
    expect(save, "a changed value is saved, once").toHaveBeenCalledTimes(1);
    expect(save, "with the new value").toHaveBeenLastCalledWith("draft two");
    expect(screen.getByRole("status"), "and the live region reports it").toHaveTextContent(
      "Saved draft two",
    );

    rerender(<SavedIndicator value="draft two" save={save} />);
    expect(
      save,
      "the same value arriving again is not a change - the dependency array is " +
        "what stops the second save",
    ).toHaveBeenCalledTimes(1);

    rerender(<SavedIndicator value="draft three" save={save} />);
    expect(save, "and the next real change saves again").toHaveBeenCalledTimes(2);
    expect(screen.getByRole("status")).toHaveTextContent("Saved draft three");
  });

  test("ex3 - LiveTotal derives the total during the render that needs it", () => {
    const onRender = vi.fn();
    const { rerender } = render(<LiveTotal items={[10, 5]} onRender={onRender} />);

    expect(screen.getByRole("status"), "10 and 5 is 15").toHaveTextContent("Total: 15");
    expect(
      onRender,
      "one render is enough to show a total you can compute from the items you " +
        "were handed (README ex3)",
    ).toHaveBeenCalledTimes(1);

    onRender.mockClear();
    rerender(<LiveTotal items={[10, 5, 7]} onRender={onRender} />);

    expect(screen.getByRole("status"), "and now it is 22").toHaveTextContent("Total: 22");
    expect(
      onRender,
      "two renders for one prop change means the total is being copied into " +
        "state by an effect: React renders the stale total, commits it, runs " +
        "the effect, sets state, renders again. A value computable from props " +
        "is not state",
    ).toHaveBeenCalledTimes(1);
  });

  test("ex4 - FilterSync reacts to a changed filter, not to a new object", () => {
    const apply = vi.fn();
    const { rerender } = render(
      <FilterSync filters={{ status: "open", sort: "newest" }} apply={apply} />,
    );

    expect(apply, "the filters are applied once on mount").toHaveBeenCalledTimes(1);
    expect(apply, "with the values it was given").toHaveBeenLastCalledWith({
      status: "open",
      sort: "newest",
    });

    rerender(<FilterSync filters={{ status: "open", sort: "newest" }} apply={apply} />);
    expect(
      apply,
      "same contents, brand new object. React compares dependencies with " +
        "Object.is, so an object built in the parent render is a different " +
        "dependency every time and the effect fires for nothing (README ex4)",
    ).toHaveBeenCalledTimes(1);

    rerender(<FilterSync filters={{ status: "closed", sort: "newest" }} apply={apply} />);
    expect(apply, "a value that really changed must apply").toHaveBeenCalledTimes(2);
    expect(apply).toHaveBeenLastCalledWith({ status: "closed", sort: "newest" });
    expect(screen.getByRole("status"), "and the summary follows").toHaveTextContent(
      "closed / newest",
    );
  });

  test("ex5 - PurchaseButton buys on every click and never on a rerender", async () => {
    const user = userEvent.setup();
    const onPurchase = vi.fn();
    const { rerender } = render(<PurchaseButton cart="cart-1" onPurchase={onPurchase} />);

    await user.click(screen.getByRole("button", { name: "Buy" }));
    expect(onPurchase, "one click, one purchase").toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status"), "and the count follows").toHaveTextContent("Orders: 1");

    await user.click(screen.getByRole("button", { name: "Buy" }));
    expect(
      onPurchase,
      "the second click bought nothing. A boolean in state plus an effect " +
        "keyed on it fires once and then never again, because setting a state " +
        "to the value it already holds is not a change. This was never an " +
        "effect - it is what the handler does (README ex5)",
    ).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("status")).toHaveTextContent("Orders: 2");

    rerender(<PurchaseButton cart="cart-2" onPurchase={onPurchase} />);
    expect(
      onPurchase,
      "a prop arriving is not a person clicking - a rerender must buy nothing",
    ).toHaveBeenCalledTimes(2);

    await user.click(screen.getByRole("button", { name: "Buy" }));
    expect(onPurchase, "and the next click still works").toHaveBeenCalledTimes(3);
    expect(onPurchase, "with the cart it has now").toHaveBeenLastCalledWith("cart-2");
  }, 30000);

  test("ex6 - Loader refetches for a new id and not for a new function", async () => {
    const calls: string[] = [];
    const pending = new Map<string, { promise: Promise<string>; resolve: (value: string) => void }>();

    function load(id: string) {
      calls.push(id);
      const slot = deferred<string>();
      pending.set(id, slot);
      return slot.promise;
    }

    async function answer(id: string, value: string) {
      const slot = pending.get(id)!;
      await settle(slot.promise, () => slot.resolve(value));
    }

    const { rerender } = render(<Loader id="a" load={(id) => load(id)} />);
    expect(calls, "the effect loads what it was mounted with").toEqual(["a"]);

    await answer("a", "Alpha");
    expect(screen.getByRole("status"), "and shows the answer").toHaveTextContent("Alpha");

    rerender(<Loader id="a" load={(id) => load(id)} />);
    expect(
      calls,
      "same id, brand new function. A function defined in the parent render is " +
        "a new value every render, so a load function in the dependency array " +
        "refetches forever - keep the latest one somewhere React does not " +
        "compare (README ex6)",
    ).toEqual(["a"]);

    rerender(<Loader id="b" load={(id) => load(id)} />);
    expect(calls, "a new id is genuinely a new request").toEqual(["a", "b"]);

    await answer("b", "Bravo");
    expect(screen.getByRole("status"), "and the new answer replaces the old").toHaveTextContent(
      "Bravo",
    );
  });

  test("ex7 - ProductPicker keeps a choice that still applies and drops one that cannot", async () => {
    const user = userEvent.setup();
    const onRender = vi.fn();
    const beans = { id: "beans", sizes: ["250g", "1kg"] };
    const mugs = { id: "mugs", sizes: ["Small", "Large"] };

    const { rerender } = render(<ProductPicker product={beans} onRender={onRender} />);
    expect(
      screen.getByRole("status"),
      "with no choice made, the first size of the current product is shown",
    ).toHaveTextContent("beans: 250g");

    await user.click(screen.getByRole("button", { name: "1kg" }));
    expect(screen.getByRole("status"), "a click chooses a size").toHaveTextContent("beans: 1kg");

    rerender(<ProductPicker product={{ id: "beans", sizes: ["250g", "1kg"] }} onRender={onRender} />);
    expect(
      screen.getByRole("status"),
      "the parent rebuilt an equal product object, which is not the same thing " +
        "as changing product. Throwing away what the user chose because a " +
        "reference changed is the bug an effect keyed on the object gives you " +
        "(README ex7)",
    ).toHaveTextContent("beans: 1kg");

    onRender.mockClear();
    rerender(<ProductPicker product={mugs} onRender={onRender} />);

    expect(
      screen.getByRole("status"),
      "a different product cannot keep a size it does not sell, so the first " +
        "size of the new product is shown",
    ).toHaveTextContent("mugs: Small");
    expect(
      onRender.mock.calls,
      "exactly one render, and the size in it already belongs to the new " +
        "product. Two renders means the reset happened in an effect, after a " +
        "commit that showed the user a mug in a 1kg size",
    ).toEqual([["mugs", "Small"]]);
  }, 30000);

  test("ex8 - ChartSync gives each external call an effect of its own", () => {
    const chart = { setData: vi.fn(), setSize: vi.fn() };
    const first = [1, 2, 3];

    const { rerender } = render(
      <ChartSync points={first} size={300} theme="light" chart={chart} />,
    );

    expect(chart.setData, "the data goes out once on mount").toHaveBeenCalledTimes(1);
    expect(chart.setData).toHaveBeenLastCalledWith(first);
    expect(chart.setSize, "and so does the size").toHaveBeenCalledTimes(1);
    expect(chart.setSize).toHaveBeenLastCalledWith(300);

    rerender(<ChartSync points={first} size={300} theme="dark" chart={chart} />);
    expect(screen.getByRole("status"), "the theme is rendered").toHaveTextContent("dark");
    expect(
      chart.setData,
      "the theme changed and the data did not. One effect that lists every " +
        "prop re-runs for every prop, and pushing the same points into a chart " +
        "again is a wasted redraw the user can see (README ex8)",
    ).toHaveBeenCalledTimes(1);
    expect(chart.setSize, "and a theme is certainly not a size").toHaveBeenCalledTimes(1);

    const second = [4, 5];
    rerender(<ChartSync points={second} size={300} theme="dark" chart={chart} />);
    expect(chart.setData, "new points do have to be pushed").toHaveBeenCalledTimes(2);
    expect(chart.setData).toHaveBeenLastCalledWith(second);
    expect(chart.setSize, "but new data is not a resize").toHaveBeenCalledTimes(1);

    rerender(<ChartSync points={second} size={480} theme="dark" chart={chart} />);
    expect(chart.setSize, "and a new size is a resize").toHaveBeenCalledTimes(2);
    expect(chart.setSize).toHaveBeenLastCalledWith(480);
    expect(chart.setData, "which is not a reload").toHaveBeenCalledTimes(2);
  });
});
