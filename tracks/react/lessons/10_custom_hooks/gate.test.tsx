// Gate for react/10_custom_hooks. Quoted verbatim in README.md.
//
// A custom hook's public API is what it returns, so these gates use
// renderHook() - Testing Library's way of running a hook inside a throwaway
// component - alongside the usual DOM assertions where a component is involved.
import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { useToggle } from "./ex1/solution";
import { useLocalStorage } from "./ex2/solution";
import { useDebouncedValue } from "./ex3/solution";
import { VisitorPanel } from "./ex4/solution";
import { useAsync } from "./challenge/solution";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

async function settle(promise: Promise<unknown>, action: () => void) {
  await act(async () => {
    action();
    await promise.catch(() => undefined);
  });
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("10_custom_hooks", () => {
  test("ex1 - useToggle flips, sets, and keeps a stable toggle function", () => {
    const { result } = renderHook(() => useToggle());

    expect(result.current[0], "with no argument the toggle starts off").toBe(false);

    const firstToggle = result.current[1];
    act(() => result.current[1]());
    expect(result.current[0], "calling toggle flips it on").toBe(true);

    act(() => result.current[1]());
    expect(result.current[0], "and calling it again flips it back").toBe(false);

    expect(
      result.current[1],
      "the toggle function must be the same object it was two renders ago. A " +
        "fresh function each render makes every consumer's dependency arrays " +
        "lie - wrap it in useCallback (README ex1)",
    ).toBe(firstToggle);

    act(() => result.current[2](true));
    expect(result.current[0], "the third slot sets an explicit value").toBe(true);

    const { result: started } = renderHook(() => useToggle(true));
    expect(started.current[0], "the argument is the initial value").toBe(true);
  });

  test("ex2 - useLocalStorage reads what is there and writes what changes", () => {
    localStorage.setItem("greeting", JSON.stringify("hello"));

    const { result } = renderHook(() => useLocalStorage("greeting", "default"));
    expect(
      result.current[0],
      "a value already in storage wins over the fallback - read it during the " +
        "initial state, not in an effect, or the first render shows the wrong " +
        "thing (README ex2)",
    ).toBe("hello");

    act(() => result.current[1]("goodbye"));
    expect(result.current[0], "setting updates the value in React").toBe("goodbye");
    expect(
      localStorage.getItem("greeting"),
      "and it has to reach localStorage as JSON, so that objects survive too",
    ).toBe(JSON.stringify("goodbye"));

    const { result: reopened } = renderHook(() => useLocalStorage("greeting", "default"));
    expect(reopened.current[0], "a fresh component reads the stored value").toBe("goodbye");

    const { result: missing } = renderHook(() => useLocalStorage("nothing-here", "fallback"));
    expect(missing.current[0], "an empty key falls back to the initial value").toBe("fallback");
  });

  test("ex3 - useDebouncedValue waits for the typing to stop", () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: "r" },
    });

    expect(result.current, "the first value is available immediately").toBe("r");

    rerender({ value: "re" });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    rerender({ value: "rea" });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(
      result.current,
      "400ms have passed but the value changed 200ms ago, so the delay has not " +
        "elapsed since the LAST change. Each new value must cancel the pending " +
        "timer and start a fresh one",
    ).toBe("r");

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(
      result.current,
      "300ms after the last change the debounced value catches up - and it " +
        "skips the values that were superseded",
    ).toBe("rea");
  });

  test("ex4 - VisitorPanel survives switching between its two shapes", async () => {
    const user = userEvent.setup();
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const { rerender } = render(<VisitorPanel signedIn={false} />);

    expect(screen.queryByText("Please sign in"), "signed out shows the prompt").not.toBeNull();

    expect(
      () => rerender(<VisitorPanel signedIn />),
      "React counts hook calls by position, so a component that calls useState " +
        "on some renders and not others loses track of which state is which - " +
        "and throws. Hooks go at the top level, before any early return " +
        "(README ex4)",
    ).not.toThrow();

    expect(screen.getByRole("status"), "signed in shows the clap counter").toHaveTextContent(
      "0 claps",
    );
    await user.click(screen.getByRole("button", { name: "Clap" }));
    expect(screen.getByRole("status"), "and the counter still works").toHaveTextContent("1 claps");

    rerender(<VisitorPanel signedIn={false} />);
    expect(screen.queryByText("Please sign in"), "and back again").not.toBeNull();
    errors.mockClear();
  }, 20000);

  test("challenge - useAsync reports loading, then data, then an error", async () => {
    const first = deferred<string>();
    const runFirst = () => first.promise;
    const { result } = renderHook(() => useAsync(runFirst));

    expect(result.current.status, "it starts out loading").toBe("loading");

    await settle(first.promise, () => first.resolve("payload"));
    expect(result.current.status, "a resolved promise means success").toBe("success");
    expect(result.current.data, "and the value is exposed as data").toBe("payload");

    const failing = deferred<string>();
    const runFailing = () => failing.promise;
    const { result: broken } = renderHook(() => useAsync(runFailing));
    await settle(failing.promise, () => failing.reject(new Error("Boom")));

    expect(broken.current.status, "a rejected promise means error").toBe("error");
    expect(
      broken.current.error,
      "and the message is exposed so a component can render it",
    ).toBe("Boom");
  });

  test("challenge - useAsync can be told to run again", async () => {
    let calls = 0;
    const run = async () => {
      calls += 1;
      return `call ${calls}`;
    };

    const { result } = renderHook(() => useAsync(run));
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.data, "the first run happens on mount").toBe("call 1");

    await act(async () => {
      result.current.reload();
    });
    await waitFor(() => expect(result.current.data).toBe("call 2"));
    expect(
      calls,
      "reload() runs the same function again - which means the fetching logic " +
        "has to live somewhere both the effect and the caller can reach",
    ).toBe(2);
  });

  test("challenge - useAsync ignores a result it no longer wants", async () => {
    const slow = deferred<string>();
    const quick = deferred<string>();
    const runSlow = () => slow.promise;
    const runQuick = () => quick.promise;

    const { result, rerender } = renderHook(({ run }) => useAsync(run), {
      initialProps: { run: runSlow },
    });

    rerender({ run: runQuick });
    await settle(quick.promise, () => quick.resolve("current"));
    expect(result.current.data, "the current run's result shows").toBe("current");

    await settle(slow.promise, () => slow.resolve("stale"));
    expect(
      result.current.data,
      "the abandoned run answered late and overwrote the answer. Every hook " +
        "that starts something asynchronous owes its users the same cleanup " +
        "guard you wrote in lesson 07",
    ).toBe("current");
  });
});
