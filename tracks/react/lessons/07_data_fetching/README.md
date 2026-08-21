# 07 — Data fetching

Lesson 06 ended with a component that fetched a user and rendered the name.
That component is a demo, not a feature, and this lesson is the difference.

A real request has three outcomes, not one. It can still be running, it can
succeed, and it can fail — and every one of those is a thing the user has to be
able to see. A component that only renders the success case shows a blank
rectangle while the network is slow and shows the same blank rectangle forever
when the server returns a 500, with the actual error visible only to whoever
opens the console. That is not an edge case; it is the ordinary experience of
using a slow connection.

Then there is the problem that makes data fetching genuinely hard, and it is
not about React at all. **Requests do not come back in the order you sent
them.** Type `re` into a search box and then `react`, and the server may well
answer `react` in 40ms and `re` in 300ms. The second answer to arrive is for a
query nobody is looking at, and unless you do something about it, it wins —
because it wrote to state last. Exercise 3 makes exactly this happen, and the
fix is three lines you will use for the rest of your career.

One convention for the whole lesson: **the fetcher is always a prop.** No
component here imports `fetch` or calls an API module directly; each takes a
function like `fetchUser: (id) => Promise<User>` and calls that. It makes the
gates deterministic — they hand you promises they control by hand — and it
makes the components honest about what they depend on.

## Concept — three states, and the answer you no longer want

**The three states.** The minimum viable shape:

```tsx
const [data, setData] = useState<T | null>(null);
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  setLoading(true);
  setError(null);
  fetchThing(id)
    .then((result) => setData(result))
    .catch((problem: unknown) => setError(String(problem)))
    .finally(() => setLoading(false));
}, [id, fetchThing]);

if (loading) return <p role="status">Loading</p>;
if (error) return <p role="alert">{error}</p>;
return <Thing data={data} />;
```

Three things in there are deliberate. `loading` starts `true`, because the
first render happens before the effect ever runs. `.finally` stops the spinner
on both paths, so there is no way to forget one. And the error is announced in
a `role="alert"` region while the wait is announced in a `role="status"` one —
a spinner nobody can see is not a loading state.

**The race.** Now the hard part. Picture two renders in quick succession:

```
render(userId="1")   →  effect starts request A
render(userId="2")   →  cleanup, then effect starts request B
                        B resolves  →  setUser(second)   ✓ correct
                        A resolves  →  setUser(first)    ✗ and it wins
```

React did nothing wrong. The `.then` attached to request A is a closure that
outlived the effect that created it, and promises have no cancel button — once
`fetchUser("1")` is in flight, its `.then` *will* run.

The fix is to make the result irrelevant rather than to prevent it:

```tsx
useEffect(() => {
  let current = true;

  fetchUser(userId).then((result) => {
    if (!current) return;      // this effect has been superseded
    setUser(result);
  });

  return () => {
    current = false;           // …and this is where that happened
  };
}, [userId, fetchUser]);
```

`current` is declared **inside the effect body**, so every run gets its own,
and the cleanup that runs when the id changes flips exactly the flag belonging
to the request it is retiring. A `useRef` or a module-level variable would be
shared between runs and would not work.

The stronger version cancels the request for real:

```tsx
const controller = new AbortController();
fetch(url, { signal: controller.signal });
return () => controller.abort();
```

That saves the bandwidth as well as the confusion, and is what you want once
the fetcher is really `fetch`. The flag is the version that works with *any*
promise, including the injected fakes here.

**Where this goes in real work.** Everything above is what a data-fetching
library — TanStack Query, SWR, a framework's loader — does for you, along with
caching, deduplication and retries. You are writing it by hand once so that
when you adopt one of those you know what it is protecting you from, and so
that you can answer the interview question about it.

## Exercise 1 — loading, then data

Edit `ex1/solution.tsx`. `UserCard({ userId, fetchUser })`:

- while the request is in flight, render a live region (`role="status"`)
  containing the word `Loading`;
- once it resolves, render the user's `name` in a level-2 heading and no
  loading region.

```
uv run dojo test react 07_data_fetching ex1
```

## Exercise 2 — and failure

Edit `ex2/solution.tsx`. `Profile({ userId, fetchUser })` does everything
`UserCard` does, plus: when the promise rejects, render the error's `message`
inside a `role="alert"` region, and stop loading.

The gate rejects with `new Error("User not found")` and expects that string on
screen.

```
uv run dojo test react 07_data_fetching ex2
```

## Exercise 3 — the race

Edit `ex3/solution.tsx`. `ProfileViewer` is written and looks correct. The gate
renders it with `userId="1"`, immediately re-renders with `userId="2"`, then
resolves the **second** request, then resolves the **first** one.

After all that, the screen must show the second user. Run it before changing
anything and watch the stale answer win.

```
uv run dojo test react 07_data_fetching ex3
```

## Exercise 4 — try again

Edit `ex4/solution.tsx`. `RetryableUser({ userId, fetchUser })` renders the
error case with a button reading `Try again` that re-runs the same request.
After a successful retry the error region is gone and the name is shown.

The gate's fetcher fails the first time and succeeds the second, and checks it
was called exactly twice.

```
uv run dojo test react 07_data_fetching ex4
```

## Challenge — pagination

Edit `challenge/solution.tsx`. `PaginatedList({ fetchPage })` where
`fetchPage(page)` resolves to `{ items: string[], hasMore: boolean }`:

- loads page 1 on mount and renders its items as a list;
- has buttons `Previous` and `Next` that move one page at a time;
- `Previous` is disabled on page 1; `Next` is disabled when the last response
  said `hasMore: false`;
- shows **only** the current page's items.

Honest difficulty note: the trap is deciding what is state. If you find
yourself storing the items *and* a page number *and* a "can I go forward" flag,
step back and ask which of those the server already tells you.

```
uv run dojo test react 07_data_fetching challenge
```

## Review — the search box race

`review1/solution.tsx`. `SearchResults({ query, fetchResults })` renders the
results as a list. The gate races two queries against each other the same way
ex3 does; the current query's results must survive.

```
uv run dojo test react 07_data_fetching review1
```

## The gate

This is the entire gate, `gate.test.tsx`:

<!-- GATE:BEGIN -->

```tsx
// Gate for react/07_data_fetching. Quoted verbatim in README.md.
//
// Nothing here touches the network. Every component takes its fetcher as a
// prop, so the gate can hand it a promise it controls by hand - which is the
// only way to test "the slow one came back last" deterministically.
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { UserCard } from "./ex1/solution";
import { Profile } from "./ex2/solution";
import { ProfileViewer } from "./ex3/solution";
import { RetryableUser } from "./ex4/solution";
import { PaginatedList } from "./challenge/solution";
import { SearchResults } from "./review1/solution";

type User = { name: string };

/** A promise plus the handles to settle it whenever the test likes. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/** Settle a deferred and let React process everything that follows. */
async function settle(promise: Promise<unknown>, action: () => void) {
  await act(async () => {
    action();
    await promise.catch(() => undefined);
  });
}

describe("07_data_fetching", () => {
  test("ex1 - UserCard shows a loading state and then the data", async () => {
    const request = deferred<User>();
    render(<UserCard userId="1" fetchUser={() => request.promise} />);

    expect(
      screen.queryByRole("status"),
      "while the request is in flight the user needs to be told something is " +
        'happening - a live region reading Loading (README ex1)',
    ).toHaveTextContent("Loading");

    await settle(request.promise, () => request.resolve({ name: "Ada" }));

    expect(
      screen.queryByRole("status"),
      "once the data has arrived the loading region must go away",
    ).toBeNull();
    expect(
      screen.queryByRole("heading", { level: 2 }),
      "and the name appears in a level-2 heading",
    ).toHaveTextContent("Ada");
  });

  test("ex2 - Profile reports a failed request instead of hanging", async () => {
    const failing = deferred<User>();
    const first = render(<Profile userId="1" fetchUser={() => failing.promise} />);

    await settle(failing.promise, () => failing.reject(new Error("User not found")));

    const alert = screen.queryByRole("alert");
    expect(
      alert,
      "a rejected promise has to become a visible error. Without a .catch (or " +
        "try/catch) the component sits on Loading forever and the failure is " +
        "only in the console (README ex2)",
    ).not.toBeNull();
    expect(alert, "show the error's message, not a generic string").toHaveTextContent(
      "User not found",
    );
    expect(
      screen.queryByRole("status"),
      "loading has to stop when the request fails, not only when it succeeds",
    ).toBeNull();
    first.unmount();

    const working = deferred<User>();
    render(<Profile userId="2" fetchUser={() => working.promise} />);
    await settle(working.promise, () => working.resolve({ name: "Lin" }));

    expect(screen.queryByRole("alert"), "a successful request shows no error").toBeNull();
    expect(
      screen.queryByRole("heading", { level: 2 }),
      "and the name is rendered as before",
    ).toHaveTextContent("Lin");
  });

  test("ex3 - ProfileViewer ignores an answer to a question it stopped asking", async () => {
    const slow = deferred<User>();
    const quick = deferred<User>();
    const fetchUser = vi.fn((id: string) => (id === "1" ? slow.promise : quick.promise));

    const { rerender } = render(<ProfileViewer userId="1" fetchUser={fetchUser} />);
    rerender(<ProfileViewer userId="2" fetchUser={fetchUser} />);

    await settle(quick.promise, () => quick.resolve({ name: "Second" }));
    expect(
      screen.queryByRole("heading", { level: 2 }),
      "the second user's request came back first and should be on screen",
    ).toHaveTextContent("Second");

    await settle(slow.promise, () => slow.resolve({ name: "First" }));
    expect(
      screen.queryByRole("heading", { level: 2 }),
      "the FIRST user's request has just landed, late, and overwritten the " +
        "screen with data nobody asked for any more. The effect that started it " +
        "was cleaned up when the id changed - use that cleanup to make its " +
        "result irrelevant (README ex3)",
    ).toHaveTextContent("Second");
    expect(
      screen.queryByText("First"),
      "no trace of the stale user should reach the DOM",
    ).toBeNull();
  });

  test("ex4 - RetryableUser can be asked again after a failure", async () => {
    const user = userEvent.setup();
    let attempts = 0;
    const fetchUser = vi.fn(async (): Promise<User> => {
      attempts += 1;
      if (attempts === 1) {
        throw new Error("Network error");
      }
      return { name: "Ada" };
    });

    render(<RetryableUser userId="1" fetchUser={fetchUser} />);

    expect(
      await screen.findByRole("alert"),
      "the first attempt fails, so an error region appears",
    ).toHaveTextContent("Network error");

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(
      await screen.findByRole("heading", { level: 2 }),
      "Try again must run the same request a second time - which means the " +
        "fetching logic has to be callable from an event handler as well as " +
        "from the effect",
    ).toHaveTextContent("Ada");
    expect(screen.queryByRole("alert"), "and the old error has to be cleared").toBeNull();
    expect(fetchUser, "exactly two requests: the original and the retry").toHaveBeenCalledTimes(2);
  }, 20000);

  test("challenge - PaginatedList walks forwards and backwards", async () => {
    const user = userEvent.setup();
    const pages: Record<number, { items: string[]; hasMore: boolean }> = {
      1: { items: ["Apples", "Apricots"], hasMore: true },
      2: { items: ["Bananas"], hasMore: false },
    };
    const fetchPage = vi.fn(async (page: number) => pages[page]);

    render(<PaginatedList fetchPage={fetchPage} />);

    expect(await screen.findByText("Apples"), "page 1 loads on mount").toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Previous" }),
      "there is no page before the first one",
    ).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText("Bananas"), "Next loads the following page").toBeInTheDocument();
    expect(
      screen.queryByText("Apples"),
      "page 1 must be gone - showing two pages at once means the items were " +
        "appended instead of replaced",
    ).toBeNull();
    expect(
      screen.getByRole("button", { name: "Next" }),
      "the server said hasMore is false, so there is nowhere left to go",
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous" }), "but back is fine now").toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(await screen.findByText("Apples"), "and back works").toBeInTheDocument();
    expect(
      fetchPage,
      "three navigations, three requests - the page number is the only state " +
        "that drives fetching (README challenge)",
    ).toHaveBeenCalledTimes(3);
  }, 20000);

  test("review1 - SearchResults keeps the results of the current query", async () => {
    const slow = deferred<string[]>();
    const quick = deferred<string[]>();
    const fetchResults = vi.fn((query: string) => (query === "re" ? slow.promise : quick.promise));

    const { rerender } = render(<SearchResults query="re" fetchResults={fetchResults} />);
    rerender(<SearchResults query="react" fetchResults={fetchResults} />);

    await settle(quick.promise, () => quick.resolve(["react", "react-dom"]));
    expect(
      screen.queryAllByRole("listitem").map((li) => li.textContent),
      "the current query's results should be listed",
    ).toEqual(["react", "react-dom"]);

    await settle(slow.promise, () => slow.resolve(["redux", "remix"]));
    expect(
      screen.queryAllByRole("listitem").map((li) => li.textContent),
      "the results for the abandoned query arrived late and replaced the list. " +
        "This is what a search box does to you every single time somebody types " +
        "quickly - guard the update with the effect's cleanup",
    ).toEqual(["react", "react-dom"]);
  });
});
```

<!-- GATE:END -->

In plain English:

- The `deferred()` helper hands back a promise plus its `resolve` and `reject`
  functions, so the gate decides exactly when — and in what order — each
  request answers. That is what makes a race testable instead of flaky.
- `settle()` wraps the resolution in `act()`, which is React's "process
  everything this caused" boundary: the state updates from the `.then` are
  flushed before the next assertion runs.
- **ex1** asserts the loading region exists *before* resolving, which is only
  possible because the promise is under the gate's control.
- **ex2** rejects, checks the alert and the absence of the loading region, then
  mounts a fresh component and resolves, checking the absence of the alert.
- **ex3** renders, re-renders with a new id, resolves the second request,
  asserts, then resolves the first and asserts *the same thing* — the second
  assertion is the whole exercise.
- **ex4** uses `findByRole`, which retries until it appears, and a counter in
  the fake fetcher to fail only the first attempt.
- **challenge** walks forward and back, checking the disabled states at each
  end and that the previous page's items are gone.
- **review1** is ex3's race in a different component, resolved in the same
  deliberate order.

## The teaching point

The race is the thing to carry away, because it is invisible in code review, it
never reproduces on a fast connection, and it is *the* data-fetching interview
question for React roles. The one-sentence answer: promises cannot be
un-started, so an effect that starts one must use its cleanup to mark the
result as no longer wanted — with a flag scoped to that effect run, or an
`AbortController` when the transport supports it.

The second thing is smaller and shows up in every code review you will ever
give: **loading and error are not edge cases, they are two thirds of the
states**. A component that renders only its happy path is a component that has
never been used on a train.

Next: **08_refs_dom**, where you finally reach for a DOM node on purpose.
