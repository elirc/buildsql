# 10 — Custom hooks

You have now written the same three lines four times: a piece of state, an
effect that keeps it in step with something, and a cleanup. Debouncing a search
box, reading from storage, subscribing to an event, fetching and tracking
loading — all the same shape, all repeated in every component that needs them.

The fix is startlingly small. **A custom hook is just a function that calls
hooks.** No registration, no base class, no API to learn. If you move that
state-plus-effect into a function whose name begins with `use`, you can call it
from any component and each caller gets its own independent copy of the state.

That last part is the bit people get wrong when they first meet it. A custom
hook is not a shared value; it is shared *logic*. Two components calling
`useToggle()` have two separate toggles, exactly as if they had each written
`useState` themselves — because that is literally what happened. If you want a
shared value, that is context (lesson 09).

The `use` prefix is not decoration either. It is how the linter knows to apply
the rules of hooks to your function, and how a reader knows the function may
contain state and therefore may not be called conditionally. Which brings us to
the rules themselves, and to exercise 4, where you fix a component that breaks
them.

## Concept — extract the shape, keep the independence

Here is a component with logic worth extracting:

```tsx
function Widget() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    window.addEventListener("online", goOnline);
    return () => window.removeEventListener("online", goOnline);
  }, []);

  return <p>{online ? "Connected" : "Offline"}</p>;
}
```

And here it is extracted — the same lines, moved:

```tsx
function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    window.addEventListener("online", goOnline);
    return () => window.removeEventListener("online", goOnline);
  }, []);

  return online;
}

function Widget() {
  const online = useOnlineStatus();
  return <p>{online ? "Connected" : "Offline"}</p>;
}
```

Nothing clever happened. The state still belongs to `Widget` — the hook has no
storage of its own — and a second component calling `useOnlineStatus()` gets its
own `useState` slot with its own value.

**What to return.** A single value if there is one (`useOnlineStatus`), a tuple
if there are exactly two and their order is obvious (`useState`'s own shape,
which is why `const [on, toggle] = useToggle()` reads naturally), and an object
once there are three or more — nobody wants to remember what the fourth element
of a tuple means.

**Return stable functions.** This is the one piece of extra care an extracted
hook needs. A function created fresh in the hook body is a new object every
render, so a consumer who puts it in a dependency array re-runs their effect
every render. `useCallback(fn, deps)` returns the same function until its
dependencies change:

```tsx
const toggle = useCallback(() => setOn((previous) => !previous), []);
```

State setters from `useState` and `dispatch` from `useReducer` are already
stable — React guarantees it — so those can be returned as they are.

**The rules of hooks**, and the reason for them. React stores hook state in a
list per component instance and matches each call to a slot **by call order**.
So:

- **Only call hooks at the top level.** Not in `if`, not in loops, not after an
  early `return`, not inside a callback.
- **Only call hooks from components or other hooks.**

If a component calls `useState` on some renders and not others, the lists stop
lining up and React throws. That is not a stylistic rule with an escape hatch;
it is the mechanism showing through, and exercise 4 makes it fail in front of
you.

**When to extract.** When the same state-and-effect appears twice, or when the
logic has a name — `useDebouncedValue`, `useLocalStorage`, `useOnlineStatus`.
Name it after *what it gives you*, not after when it runs (`useOnMount` is a
bad name because it describes the mechanism rather than the meaning).

## Exercise 1 — a hook of your own

Edit `ex1/solution.tsx`. `useToggle(initial = false)` returns a tuple:

```tsx
const [on, toggle, setOn] = useToggle();
```

`toggle` flips the value, `setOn` sets it explicitly, and the gate also checks
that **`toggle` is the same function object across renders**.

```
uv run dojo test react 10_custom_hooks ex1
```

## Exercise 2 — state that survives a reload

Edit `ex2/solution.tsx`. `useLocalStorage(key, initialValue)` returns
`[value, setValue]`, where:

- the initial value comes from `localStorage` when that key exists, and from
  `initialValue` when it does not — **on the first render**, not after an
  effect;
- calling the setter updates React *and* writes to `localStorage`;
- values are stored as JSON, so objects and numbers survive the round trip.

```
uv run dojo test react 10_custom_hooks ex2
```

## Exercise 3 — debouncing

Edit `ex3/solution.tsx`. `useDebouncedValue(value, delay)` returns a value that
follows its argument only after `delay` milliseconds have passed **since the
last change**. Values that are superseded before the delay elapses are never
returned at all.

This is the hook that stops a search box firing a request per keystroke, and
you will use it again in the interview drills.

```
uv run dojo test react 10_custom_hooks ex3
```

## Exercise 4 — the rules of hooks

Edit `ex4/solution.tsx`. `VisitorPanel({ signedIn })` shows `Please sign in`
when signed out and a clap counter when signed in. It compiles, and it throws
the moment `signedIn` changes.

Run the gate, read React's error, then fix it so that switching in both
directions works and the counter still counts.

```
uv run dojo test react 10_custom_hooks ex4
```

## Challenge — one hook for all your data fetching

Edit `challenge/solution.tsx`. `useAsync(run)` takes a function returning a
promise and returns:

```tsx
{ status: "loading" | "success" | "error", data, error, reload }
```

- `status` starts at `"loading"` and the effect runs `run()` on mount;
- on success, `data` holds the value and `status` is `"success"`;
- on failure, `error` holds the `Error`'s **message** and `status` is
  `"error"`;
- `reload()` runs it again;
- a result from a run that has been superseded is **ignored** — the gate
  resolves an abandoned run last and checks it did not win.

`run` is required to be stable across renders (the caller wraps it in
`useCallback`). Everything else is the lesson-07 material, packaged.

Honest difficulty note: this is the biggest single piece of code in the track so
far, but every part of it is something you have already written once.

```
uv run dojo test react 10_custom_hooks challenge
```

## The gate

This is the entire gate, `gate.test.tsx`:

<!-- GATE:BEGIN -->

```tsx
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
```

<!-- GATE:END -->

In plain English:

- `renderHook(fn)` renders a throwaway component that calls `fn` and exposes
  the return value as `result.current`. It is the right tool for a hook because
  a hook's return value *is* its public interface — no component internals are
  being poked at. Anything that changes state goes inside `act()`, so React
  finishes rendering before the next assertion.
- **ex1** flips twice, compares the `toggle` function against the one from
  three renders ago, uses the explicit setter, and mounts a second hook with an
  initial value.
- **ex2** seeds `localStorage`, checks the hook found it, writes through the
  setter and checks both React and storage, then mounts a *fresh* hook to prove
  the write persisted. `localStorage.clear()` runs before every test.
- **ex3** uses fake timers and `rerender` to simulate typing: change, wait
  200ms, change again, wait 200ms — 400ms total, but only 200ms since the last
  change, so nothing may have happened yet.
- **ex4** wraps the re-render in `expect(...).not.toThrow()` so the failure
  carries an explanation rather than only React's stack trace.
- **challenge** is three tests — the happy path and the error path, `reload`,
  and the race — and all three must pass for the exercise to count.

## The teaching point

The reason custom hooks matter is not that they save typing. It is that they
give a *name* to a piece of behaviour, and once behaviour has a name it can be
tested, reused and reasoned about on its own. `useDebouncedValue` is eight lines
you could paste into a component; as a hook it becomes something you can say
out loud, hand to a colleague, and fix in one place.

The rules of hooks are worth understanding rather than obeying. Once you know
React is matching calls to slots by position, "no hooks in conditionals" stops
being arbitrary and the error message stops being frightening. It also tells you
what the escape hatches are: to skip work, put the condition *inside* the hook
(a `useEffect` that returns early); to reset state, change the component's
`key`; to vary the number of hooks, split into two components.

Next: **11_performance_patterns**, where you find out which of your instincts
about speed are actually true.
