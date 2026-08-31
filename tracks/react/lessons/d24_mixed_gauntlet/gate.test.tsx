// Gate for react/d24_mixed_gauntlet. Quoted verbatim in README.md.
//
// The last set: every exercise is two or three of the track's ideas at once.
// The instruments are the same ones used all the way through - injected
// fetchers resolved by hand, fake timers with fireEvent, onRender spies, and
// assertions only about what a user could see or hear.
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { VoucherBox } from "./ex1/solution";
import { RosterBoard } from "./ex2/solution";
import { IdleWatcher } from "./ex3/solution";
import { SessionProvider, ProfilePane } from "./ex4/solution";
import { useCart, CartPanel } from "./ex5/solution";
import { ToastQueue } from "./ex6/solution";
import { SearchWorkbench } from "./ex7/solution";
import { Wizard } from "./ex8/solution";

type Slot<T> = { promise: Promise<T>; resolve: (value: T) => void };

function deferred<T>(): Slot<T> {
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

const names = (pattern: RegExp) =>
  screen.queryAllByRole("button", { name: pattern }).map((node) => node.textContent);

afterEach(() => {
  vi.useRealTimers();
});

describe("d24_mixed_gauntlet", () => {
  test("ex1 - VoucherBox judges the code, not the typing", () => {
    const onRedeem = vi.fn();
    render(<VoucherBox onRedeem={onRedeem} />);

    const box = screen.getByLabelText("Voucher");
    expect(screen.getByRole("status"), "an empty box has nothing to redeem").toHaveTextContent(
      "Keep typing",
    );
    expect(screen.getByRole("button", { name: "Redeem" })).toBeDisabled();

    fireEvent.change(box, { target: { value: "  ab  " } });
    expect(box, "the box shows exactly what was typed, spaces and all").toHaveValue("  ab  ");
    expect(
      screen.getByRole("status"),
      "but the code is what is left after trimming, and two characters is not " +
        "five. Judging the raw string counts the spaces the user cannot see " +
        "(README ex1)",
    ).toHaveTextContent("Keep typing");

    fireEvent.change(box, { target: { value: "  spring20 " } });
    expect(screen.getByRole("status"), "now there is a code").toHaveTextContent("Ready");
    const redeem = screen.getByRole("button", { name: "Redeem" });
    expect(redeem, "and something to press").toBeEnabled();

    fireEvent.click(redeem);
    expect(
      onRedeem,
      "the server wants the code, not the keystrokes - trimmed and upper case",
    ).toHaveBeenLastCalledWith("SPRING20");
  }, 30000);

  test("ex2 - RosterBoard promotes one person at a time", () => {
    const { rerender } = render(<RosterBoard people={["Ada", "Bo", "Cai"]} />);

    expect(names(/^Promote/), "everyone, in the order they came").toEqual([
      "Promote Ada",
      "Promote Bo",
      "Promote Cai",
    ]);
    expect(screen.queryByText("Ada (lead)"), "nobody leads to begin with").toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Promote Bo" }));
    expect(screen.queryByText("Bo (lead)"), "the promoted person leads").not.toBeNull();
    expect(names(/^Promote/), "and goes to the front").toEqual([
      "Promote Bo",
      "Promote Ada",
      "Promote Cai",
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Promote Cai" }));
    expect(screen.queryByText("Cai (lead)"), "a new lead leads").not.toBeNull();
    expect(
      screen.queryByText("Bo (lead)"),
      "and the old one stops - there is one lead, so it is one piece of state, " +
        "not a flag on every row (README ex2)",
    ).toBeNull();
    expect(
      names(/^Promote/),
      "the new lead is at the front and everybody else is back in the order " +
        "they arrived in",
    ).toEqual(["Promote Cai", "Promote Ada", "Promote Bo"]);

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(names(/^Promote/), "reset puts the roster back as it arrived").toEqual([
      "Promote Ada",
      "Promote Bo",
      "Promote Cai",
    ]);
    expect(screen.queryByText("Ada (lead)"), "with nobody leading").toBeNull();

    rerender(<RosterBoard people={[]} />);
    expect(screen.queryByRole("status"), "an empty roster says so").toHaveTextContent(
      "Nobody on the roster",
    );
    expect(screen.queryAllByRole("listitem").length, "and lists nothing").toBe(0);
  }, 30000);

  test("ex3 - IdleWatcher starts counting again every time something happens", () => {
    vi.useFakeTimers();
    const first = vi.fn();
    const second = vi.fn();

    const { rerender, unmount } = render(<IdleWatcher timeoutMs={1000} onIdle={first} />);

    expect(screen.getByRole("status"), "somebody is here").toHaveTextContent("Active");

    act(() => {
      vi.advanceTimersByTime(900);
    });
    fireEvent.click(screen.getByRole("button", { name: "Activity" }));
    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(
      screen.getByRole("status"),
      "1800ms have passed and none of it was quiet for a whole second. An " +
        "effect that starts the countdown once never restarts it, and the page " +
        "logs somebody out while they are typing (README ex3)",
    ).toHaveTextContent("Active");
    expect(first, "so nothing has gone idle").not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByRole("status"), "a full second of quiet is idle").toHaveTextContent("Idle");
    expect(first, "reported once").toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(first, "and once only").toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount(), "with nothing left ticking").toBe(0);

    rerender(<IdleWatcher timeoutMs={1000} onIdle={second} />);
    fireEvent.click(screen.getByRole("button", { name: "Activity" }));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(
      second,
      "the parent passed a new callback, and it is the one that should be told",
    ).toHaveBeenCalledTimes(1);
    expect(first, "not the one from the render the timer was started in").toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Activity" }));
    unmount();
    expect(vi.getTimerCount(), "and leaving stops the clock").toBe(0);
  }, 30000);

  test("ex4 - ProfilePane loads the user the session is for", async () => {
    const one = deferred<{ name: string }>();
    const two = deferred<{ name: string }>();
    const byId: Record<string, Slot<{ name: string }>> = { u1: one, u2: two };
    const loadProfile = vi.fn((userId: string) => byId[userId].promise);

    const { rerender } = render(
      <SessionProvider userId="u1">
        <div>
          <section>
            <ProfilePane loadProfile={loadProfile} />
          </section>
        </div>
      </SessionProvider>,
    );

    expect(loadProfile, "the id comes from the context, not from a prop").toHaveBeenCalledWith("u1");
    expect(screen.getByRole("status")).toHaveTextContent("Loading profile");

    rerender(
      <SessionProvider userId="u2">
        <div>
          <section>
            <ProfilePane loadProfile={loadProfile} />
          </section>
        </div>
      </SessionProvider>,
    );
    expect(loadProfile, "a new session is a new request").toHaveBeenLastCalledWith("u2");

    await settle(two.promise, () => two.resolve({ name: "Nils" }));
    expect(screen.queryByRole("heading", { name: "Nils" }), "the current user appears").not.toBeNull();

    await settle(one.promise, () => one.resolve({ name: "Rosa" }));
    expect(
      screen.queryByRole("heading", { name: "Nils" }),
      "the first request answered last, and the session it belonged to is over. " +
        "Showing its answer means showing one person another person-s profile " +
        "(README ex4)",
    ).not.toBeNull();
    expect(screen.queryByText("Rosa"), "so it changes nothing").toBeNull();
  }, 30000);

  test("ex5 - useCart adds up, and hands back the same functions", () => {
    const { result, rerender } = renderHook(() => useCart());

    const api = result.current;
    expect(result.current.total, "an empty cart is worth nothing").toBe(0);

    act(() => result.current.add({ id: "beans", name: "Beans", price: 750 }));
    act(() => result.current.add({ id: "beans", name: "Beans", price: 750 }));
    expect(result.current.lines, "the same product twice is a quantity").toEqual([
      { id: "beans", name: "Beans", price: 750, qty: 2 },
    ]);
    expect(
      result.current.total,
      "and the total is worked out from the lines rather than kept beside them, " +
        "where it would have to be updated by every action that ever touches " +
        "the cart (README ex5)",
    ).toBe(1500);

    rerender();
    expect(
      result.current.add,
      "the functions a hook hands out have to survive a render, or every " +
        "consumer of this cart re-renders for nothing",
    ).toBe(api.add);
    expect(result.current.remove).toBe(api.remove);

    act(() => result.current.remove("beans"));
    expect(result.current.lines, "removing takes one away").toEqual([
      { id: "beans", name: "Beans", price: 750, qty: 1 },
    ]);
    act(() => result.current.remove("beans"));
    expect(result.current.lines, "and the last one takes the line").toEqual([]);
    expect(result.current.total).toBe(0);

    render(
      <CartPanel
        products={[
          { id: "beans", name: "Beans", price: 750 },
          { id: "mug", name: "Mug", price: 500 },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Add Mug" }));
    fireEvent.click(screen.getByRole("button", { name: "Add Beans" }));
    expect(
      screen.queryAllByRole("listitem").map((node) => node.textContent),
      "and the panel is only the markup - the hook is the cart",
    ).toEqual(["Mug x1", "Beans x1"]);
    expect(screen.getByRole("status")).toHaveTextContent("Total: 1250");
  }, 30000);

  test("ex6 - ToastQueue clears each toast on its own clock", () => {
    vi.useFakeTimers();
    const { unmount } = render(<ToastQueue autoDismissMs={1000} />);

    fireEvent.click(screen.getByRole("button", { name: "Notify" }));
    act(() => {
      vi.advanceTimersByTime(500);
    });
    fireEvent.click(screen.getByRole("button", { name: "Notify" }));

    expect(names(/^Dismiss/), "two toasts, half a second apart").toEqual([
      "Dismiss Message 1",
      "Dismiss Message 2",
    ]);

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(
      names(/^Dismiss/),
      "a second after it appeared, the first one goes - and the second has " +
        "half a second left. One timer for the whole queue cannot express that: " +
        "each toast has its own clock, which means each toast owns its own " +
        "effect (README ex6)",
    ).toEqual(["Dismiss Message 2"]);

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(names(/^Dismiss/), "and then that one too").toEqual([]);
    expect(vi.getTimerCount(), "with nothing left scheduled").toBe(0);

    fireEvent.click(screen.getByRole("button", { name: "Notify" }));
    expect(names(/^Dismiss/), "a third toast gets a number nobody has had").toEqual([
      "Dismiss Message 3",
    ]);
    fireEvent.click(screen.getByRole("button", { name: "Dismiss Message 3" }));
    expect(names(/^Dismiss/), "dismissing by hand works too").toEqual([]);
    expect(vi.getTimerCount(), "and cancels the timer that was going to do it").toBe(0);

    fireEvent.click(screen.getByRole("button", { name: "Notify" }));
    unmount();
    expect(vi.getTimerCount(), "as does leaving the page").toBe(0);
  }, 30000);

  test("ex7 - SearchWorkbench waits for the typing to stop and shows the right answer", async () => {
    vi.useFakeTimers();
    const slots = new Map<string, Slot<string[]>>();
    const search = vi.fn((query: string) => {
      const slot = deferred<string[]>();
      slots.set(query, slot);
      return slot.promise;
    });

    render(<SearchWorkbench search={search} />);

    expect(screen.getByRole("status"), "nothing has been asked yet").toHaveTextContent("Idle");

    const box = screen.getByLabelText("Query");
    fireEvent.change(box, { target: { value: "co" } });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    fireEvent.change(box, { target: { value: "cof" } });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(
      search,
      "two keystroke, 400ms, and no request - because neither of them was " +
        "followed by 300ms of quiet. A debounce that does not cancel the " +
        "pending call is just a delay (README ex7)",
    ).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(search, "300ms after the last keystroke, one request").toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenLastCalledWith("cof");
    expect(screen.getByRole("status")).toHaveTextContent("Searching");

    fireEvent.change(box, { target: { value: "coffee" } });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(search, "and a new question is a new request").toHaveBeenCalledTimes(2);

    await settle(slots.get("coffee")!.promise, () =>
      slots.get("coffee")!.resolve(["Coffee beans", "Coffee filters"]),
    );
    expect(
      screen.queryAllByRole("listitem").map((node) => node.textContent),
      "the current query-s results are listed",
    ).toEqual(["Coffee beans", "Coffee filters"]);
    expect(screen.getByRole("status")).toHaveTextContent("2 results");

    await settle(slots.get("cof")!.promise, () => slots.get("cof")!.resolve(["Coffin nails"]));
    expect(
      screen.queryAllByRole("listitem").map((node) => node.textContent),
      "the abandoned query answered last and it must lose - debouncing makes a " +
        "race rarer, it does not make it impossible",
    ).toEqual(["Coffee beans", "Coffee filters"]);
  }, 30000);

  test("ex8 - Wizard shows one step and takes the keyboard with it", () => {
    render(
      <Wizard>
        <Wizard.Step title="Your details">
          <p>Name and address</p>
        </Wizard.Step>
        <Wizard.Step title="Delivery">
          <p>Where it goes</p>
        </Wizard.Step>
        <Wizard.Step title="Payment">
          <p>How you pay</p>
        </Wizard.Step>
        <Wizard.Nav />
      </Wizard>,
    );

    expect(
      screen.queryByRole("heading", { name: "Your details" }),
      "the first step is showing",
    ).not.toBeNull();
    expect(screen.queryByText("Where it goes"), "and only that one").toBeNull();
    expect(screen.getByRole("status"), "with a count of where you are").toHaveTextContent(
      "Step 1 of 3",
    );
    expect(screen.getByRole("button", { name: "Back" }), "and nothing behind it").toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.queryByText("Where it goes"), "next moves on").not.toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("Step 2 of 3");
    expect(
      screen.getByRole("heading", { name: "Delivery" }),
      "and the keyboard goes with it. The step that was focused has just been " +
        "removed from the document, so focus falls to the body unless the new " +
        "step catches it - which needs tabIndex -1 to be focusable at all " +
        "(README ex8)",
    ).toHaveFocus();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("status")).toHaveTextContent("Step 3 of 3");
    expect(screen.getByRole("button", { name: "Next" }), "and there is no fourth step").toBeDisabled();
    expect(screen.getByRole("heading", { name: "Payment" })).toHaveFocus();

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.queryByText("Where it goes"), "back goes back").not.toBeNull();
    expect(screen.getByRole("heading", { name: "Delivery" }), "taking focus again").toHaveFocus();
  }, 30000);
});
