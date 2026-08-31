// Gate for react/d20_custom_hooks_2. Quoted verbatim in README.md.
//
// These hooks talk to something outside React, so everything outside React is
// injected: subscriptions, stores and loaders are all functions this file
// hands in. Anything timed uses fake timers.
import { act, fireEvent, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { useKeyPress } from "./ex1/solution";
import { useSubscription } from "./ex2/solution";
import { usePaged } from "./ex3/solution";
import { useDebouncedCallback } from "./ex4/solution";
import { useStorageState } from "./ex5/solution";
import { useIntervalPoll } from "./ex6/solution";
import { useLoggedReducer } from "./ex7/solution";
import { useControllableState } from "./ex8/solution";

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

afterEach(() => {
  vi.useRealTimers();
});

describe("d20_custom_hooks_2", () => {
  test("ex1 - useKeyPress calls the handler the component has now", () => {
    const first = vi.fn();
    const second = vi.fn();

    const { rerender, unmount } = renderHook(
      ({ handler }: { handler: () => void }) => useKeyPress("s", handler),
      { initialProps: { handler: first } },
    );

    fireEvent.keyDown(document, { key: "s" });
    expect(first, "the key it was told about fires the handler").toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: "j" });
    expect(first, "and any other key does not").toHaveBeenCalledTimes(1);

    rerender({ handler: second });
    fireEvent.keyDown(document, { key: "s" });
    expect(
      second,
      "the parent passed a new function, and the shortcut has to run that one. " +
        "A listener registered once with an empty dependency array keeps " +
        "calling the function from the first render for ever - and adding the " +
        "handler to the array instead means tearing the listener down and " +
        "putting it back on every render (README ex1)",
    ).toHaveBeenCalledTimes(1);
    expect(first, "and the old one is never called again").toHaveBeenCalledTimes(1);

    unmount();
    fireEvent.keyDown(document, { key: "s" });
    expect(
      second,
      "a document listener that outlives its component keeps firing, and every " +
        "mount adds another one",
    ).toHaveBeenCalledTimes(1);
  }, 30000);

  test("ex2 - useSubscription opens one connection and closes the one it replaces", () => {
    const unsubA = vi.fn();
    const unsubB = vi.fn();
    let pushA: ((value: number) => void) | null = null;
    let pushB: ((value: number) => void) | null = null;

    const subscribeA = vi.fn((onValue: (value: number) => void) => {
      pushA = onValue;
      return unsubA;
    });
    const subscribeB = vi.fn((onValue: (value: number) => void) => {
      pushB = onValue;
      return unsubB;
    });

    const { result, rerender, unmount } = renderHook(
      ({ subscribe }: { subscribe: (onValue: (value: number) => void) => () => void }) =>
        useSubscription(subscribe, 0),
      { initialProps: { subscribe: subscribeA } },
    );

    expect(result.current, "before anything arrives it is the value you gave it").toBe(0);
    expect(subscribeA, "one subscription on mount").toHaveBeenCalledTimes(1);

    act(() => pushA!(7));
    expect(result.current, "and what is pushed is what it holds").toBe(7);

    rerender({ subscribe: subscribeA });
    expect(subscribeA, "the same source is not a new source").toHaveBeenCalledTimes(1);

    rerender({ subscribe: subscribeB });
    expect(subscribeB, "a different source is").toHaveBeenCalledTimes(1);
    expect(
      unsubA,
      "and the one it replaced has to be closed. An effect that opens something " +
        "and returns no cleanup leaks one connection per change, all of them " +
        "still pushing (README ex2)",
    ).toHaveBeenCalledTimes(1);

    act(() => pushB!(12));
    expect(result.current).toBe(12);

    unmount();
    expect(unsubB, "and leaving closes the last one").toHaveBeenCalledTimes(1);
  }, 30000);

  test("ex3 - usePaged cannot be left on a page that no longer exists", () => {
    const ten = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];

    const { result, rerender } = renderHook(
      ({ items }: { items: string[] }) => usePaged(items, 4),
      { initialProps: { items: ten } },
    );

    expect(result.current.page, "it starts on page one").toBe(1);
    expect(result.current.totalPages, "ten items, four to a page, three pages").toBe(3);
    expect(result.current.pageItems).toEqual(["a", "b", "c", "d"]);
    expect(result.current.hasPrev).toBe(false);

    act(() => result.current.next());
    act(() => result.current.next());
    expect(result.current.page).toBe(3);
    expect(result.current.pageItems, "the last page is the short one").toEqual(["i", "j"]);
    expect(result.current.hasNext, "and there is nothing after it").toBe(false);

    act(() => result.current.next());
    expect(result.current.page, "so next does nothing there").toBe(3);

    rerender({ items: ten.slice(0, 5) });
    expect(result.current.totalPages, "five items is two pages").toBe(2);
    expect(
      result.current.page,
      "the reader was on page three of a list that now has two. A page number " +
        "kept in state points at nothing until something clamps it, and the " +
        "user sees an empty page with no way to understand why - work the " +
        "shown page out during render (README ex3)",
    ).toBe(2);
    expect(result.current.pageItems).toEqual(["e"]);

    act(() => result.current.prev());
    expect(result.current.page).toBe(1);
    expect(result.current.pageItems).toEqual(["a", "b", "c", "d"]);
    act(() => result.current.prev());
    expect(result.current.page, "and there is nothing before page one").toBe(1);
  }, 30000);

  test("ex4 - useDebouncedCallback waits, cancels, and stays the same function", () => {
    vi.useFakeTimers();
    const first = vi.fn();
    const second = vi.fn();

    const { result, rerender, unmount } = renderHook(
      ({ fn }: { fn: (value: string) => void }) => useDebouncedCallback(fn, 500),
      { initialProps: { fn: first } },
    );

    const debounced = result.current;

    act(() => result.current("a"));
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(first, "400ms is not 500ms").not.toHaveBeenCalled();

    act(() => result.current("b"));
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(
      first,
      "a second call inside the window has to cancel the one that was already " +
        "pending, or the debounce is just a delay and every call still goes out " +
        "(README ex4)",
    ).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(first, "500ms after the last call, exactly one call").toHaveBeenCalledTimes(1);
    expect(first, "with the arguments of the last one").toHaveBeenCalledWith("b");

    rerender({ fn: second });
    expect(
      result.current,
      "the debounced function itself must not change - anything holding on to " +
        "it, an event handler on a memoized child say, would be holding a " +
        "different debounce with its own pending timeout",
    ).toBe(debounced);

    act(() => result.current("c"));
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(second, "and it calls the newest function it was given").toHaveBeenCalledWith("c");
    expect(first, "not the one from the render it was built in").toHaveBeenCalledTimes(1);

    act(() => result.current("d"));
    unmount();
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(second, "a call still pending when the component goes is cancelled").toHaveBeenCalledTimes(
      1,
    );
    expect(vi.getTimerCount(), "with no timer left behind").toBe(0);
  }, 30000);

  test("ex5 - useStorageState follows its key", () => {
    const data: Record<string, string> = { "draft:a": JSON.stringify("Alpha") };
    const storage = {
      getItem: vi.fn((key: string) => data[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        data[key] = value;
      }),
    };

    const { result, rerender } = renderHook(
      ({ key }: { key: string }) => useStorageState(key, "nothing yet", storage),
      { initialProps: { key: "draft:a" } },
    );

    expect(
      result.current[0],
      "the stored value is there on the first render, not after an effect - a " +
        "hook that loads in an effect shows the fallback for one frame first",
    ).toBe("Alpha");

    act(() => result.current[1]("Alpha edited"));
    expect(result.current[0], "setting sets").toBe("Alpha edited");
    expect(storage.setItem, "and writes it back, as JSON").toHaveBeenLastCalledWith(
      "draft:a",
      JSON.stringify("Alpha edited"),
    );

    rerender({ key: "draft:b" });
    expect(
      result.current[0],
      "a different key is a different piece of data, and nothing is stored " +
        "under this one yet. useState keeps whatever it was initialised with " +
        "for the life of the component, so a hook whose key can change has to " +
        "notice that itself (README ex5)",
    ).toBe("nothing yet");

    act(() => result.current[1]("Bravo"));
    expect(storage.setItem).toHaveBeenLastCalledWith("draft:b", JSON.stringify("Bravo"));

    rerender({ key: "draft:a" });
    expect(result.current[0], "and going back finds what was saved there").toBe("Alpha edited");

    rerender({ key: "draft:b" });
    expect(result.current[0], "as does going forward again").toBe("Bravo");
  }, 30000);

  test("ex6 - useIntervalPoll does not ask again while it is still waiting", async () => {
    vi.useFakeTimers();
    const slots: Array<Slot<string>> = [];
    const load = vi.fn(() => {
      const slot = deferred<string>();
      slots.push(slot);
      return slot.promise;
    });

    const { result, unmount } = renderHook(() => useIntervalPoll(load, 1000));

    expect(load, "the first poll goes out straight away").toHaveBeenCalledTimes(1);
    expect(result.current.data, "with nothing to show yet").toBeNull();

    await settle(slots[0].promise, () => slots[0].resolve("one"));
    expect(result.current.data, "then the answer").toBe("one");

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(load, "and a second poll a second later").toHaveBeenCalledTimes(2);

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(
      load,
      "three more ticks went by with the second request still out. Firing again " +
        "anyway is how a slow server turns one poll a second into a queue that " +
        "never drains - a poll while one is in flight is a poll to skip " +
        "(README ex6)",
    ).toHaveBeenCalledTimes(2);

    await settle(slots[1].promise, () => slots[1].resolve("two"));
    expect(result.current.data, "the newest answer replaces the old").toBe("two");

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(load, "and now that it is free, polling carries on").toHaveBeenCalledTimes(3);

    unmount();
    expect(vi.getTimerCount(), "leaving stops the polling").toBe(0);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(load, "for good").toHaveBeenCalledTimes(3);
  }, 30000);

  test("ex7 - useLoggedReducer logs the state the action produced", () => {
    type Count = { total: number };
    type CountAction = { type: "added"; by: number } | { type: "cleared" };

    function reducer(state: Count, action: CountAction): Count {
      return action.type === "added" ? { total: state.total + action.by } : { total: 0 };
    }

    const first = vi.fn();
    const second = vi.fn();

    const { result, rerender } = renderHook(
      ({ log }: { log: (action: CountAction, next: Count) => void }) =>
        useLoggedReducer(reducer, { total: 0 }, log),
      { initialProps: { log: first } },
    );

    const dispatch = result.current[1];

    act(() => result.current[1]({ type: "added", by: 3 }));
    expect(result.current[0], "the reducer still does the real work").toEqual({ total: 3 });
    expect(
      first,
      "and the log is told what came out, not what went in. Reading the state " +
        "variable inside the wrapper gives you the render-s value, which is the " +
        "state as it was before this action - so every line of the log is one " +
        "step behind (README ex7)",
    ).toHaveBeenLastCalledWith({ type: "added", by: 3 }, { total: 3 });

    act(() => result.current[1]({ type: "added", by: 4 }));
    expect(result.current[0]).toEqual({ total: 7 });
    expect(first).toHaveBeenLastCalledWith({ type: "added", by: 4 }, { total: 7 });
    expect(first, "one line per action").toHaveBeenCalledTimes(2);

    rerender({ log: second });
    expect(
      result.current[1],
      "dispatch is the one thing a reducer hook promises never to change, and a " +
        "wrapper around it has to keep that promise - consumers put it in " +
        "dependency arrays precisely because of it",
    ).toBe(dispatch);

    act(() => result.current[1]({ type: "cleared" }));
    expect(result.current[0], "clearing clears").toEqual({ total: 0 });
    expect(second, "and the newest log gets the line").toHaveBeenLastCalledWith(
      { type: "cleared" },
      { total: 0 },
    );
    expect(first, "not the one from the render dispatch was built in").toHaveBeenCalledTimes(2);
  }, 30000);

  test("ex8 - useControllableState lets the parent take over, or not", () => {
    const uncontrolledChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: "a", onChange: uncontrolledChange }),
    );

    expect(result.current[0], "with no value prop it starts at the default").toBe("a");
    act(() => result.current[1]("b"));
    expect(result.current[0], "and it owns the value itself").toBe("b");
    expect(uncontrolledChange, "telling the parent anyway").toHaveBeenLastCalledWith("b");

    const controlledChange = vi.fn();
    const { result: controlled, rerender } = renderHook(
      ({ value }: { value: string }) =>
        useControllableState({ value, defaultValue: "x", onChange: controlledChange }),
      { initialProps: { value: "p" } },
    );

    expect(controlled.current[0], "with a value prop, that is the value").toBe("p");

    act(() => controlled.current[1]("q"));
    expect(controlledChange, "the setter asks the parent for the change").toHaveBeenLastCalledWith(
      "q",
    );
    expect(
      controlled.current[0],
      "and nothing else. A controlled component that also keeps its own copy " +
        "shows one thing while its parent believes another, which is the whole " +
        "reason the parent asked to control it (README ex8)",
    ).toBe("p");

    rerender({ value: "q" });
    expect(controlled.current[0], "it changes when the parent changes it").toBe("q");

    rerender({ value: "r" });
    expect(controlled.current[0], "every time").toBe("r");
  }, 30000);
});
