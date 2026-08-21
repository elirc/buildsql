# 06 — Effects

Everything you have written so far lives entirely inside React. Props come in,
markup goes out, clicks change state, React updates the DOM. Nothing in that
loop touches the world.

But real applications do touch the world. They set the document title, listen
for a key press on `document`, open a WebSocket, start a timer, or ask a server
for something. Those are **side effects**: work that happens *because* a
component rendered, but is not part of producing the markup. They cannot go in
the render body — rendering has to be pure, must be safe to run twice, and must
not do anything the user can observe. So React gives them their own place:
`useEffect`.

`useEffect` is also, by a wide margin, the most misused hook in React. Two
things go wrong. People put things in it that were never side effects — deriving
a value, responding to a click — and end up with an extra render and a bug
where the UI is briefly inconsistent. And people get the dependency array wrong,
which produces either an effect that never re-runs (stale data) or one that
re-runs forever (a loop that hammers an API).

This lesson teaches the dependency array honestly. It is not a performance knob
and it is not a list you tune until the warnings stop. It is a **claim you are
making**: "this effect reads exactly these values, and if none of them changed,
running it again would produce the same result." When that claim is false, the
consequences are the two failure modes above.

## Concept — synchronise, do not react

```tsx
useEffect(() => {
  // 1. the effect: run after React has updated the DOM
  const socket = connect(roomId);

  // 2. the cleanup: undo the effect
  return () => socket.close();
}, [roomId]);   // 3. the dependencies
```

React runs the effect after the render is committed. Before running it again —
and once more when the component unmounts — it runs whatever the previous run
returned. So the sequence on a changed `roomId` is: *close the old socket, open
the new one.* Cleanup first, always.

**The dependency array.** React compares each entry with `Object.is` against
the previous run:

- **omitted entirely** — run after every render;
- **`[]`** — run once after mount, clean up on unmount, never in between;
- **`[a, b]`** — run again whenever `a` or `b` changed.

The rule for filling it in is mechanical, and it is the rule the
`react-hooks/exhaustive-deps` lint rule applies: **every value from inside the
component that the effect reads goes in the array.** Props, state, and anything
computed from them. Not `document`, not an imported function, not a `setState`
setter (React guarantees those are stable).

That rule exists because of a fact you already met in lesson 03: **a function
created during a render closes over that render's values, permanently.** An
effect body is such a function. If it reads `count` and `count` is not in the
deps, the effect that is still running was created in an older render and is
looking at an older `count` — a **stale closure**. It does not go stale
gradually; it was never anything else.

Here is the classic, and you will fix it in the challenge:

```tsx
useEffect(() => {
  const id = setInterval(() => setSeconds(seconds + 1), 1000);
  return () => clearInterval(id);
}, [running]);
```

`seconds` is read but not listed. The interval callback captured `seconds` at
`0` and every tick computes `0 + 1`. The counter sticks at 1 forever. There are
two ways out — add `seconds` to the deps (and tear down and recreate the
interval every second, which drifts), or stop reading `seconds` at all by using
the updater form. The second is almost always right, and the general principle
behind it is: **if you find yourself fighting the dependency array, the effect
is usually reading something it should have been describing instead.**

**Effects you should not write.** Before reaching for `useEffect`, ask:

- *Can I compute this during render?* Then do — a filtered list, a total, a
  validity flag. An effect that sets state from props renders twice and flickers.
- *Did this happen because of a specific user action?* Then it belongs in the
  event handler. Sending an analytics event or a POST when a button is clicked
  is not a synchronisation problem, and putting it in an effect makes it fire
  in situations you did not intend.

`useEffect` is for **synchronising with something outside React** — the
document, a subscription, a timer, a server. That framing answers most "should
this be an effect" questions on its own.

## Exercise 1 — an effect with a cleanup

Edit `ex1/solution.tsx`. `PageTitle({ title })` renders nothing and sets
`document.title` to the `title` prop. When the prop changes the document must
follow, and when the component unmounts the title must be restored to whatever
it was before the component mounted.

```
uv run dojo test react 06_effects ex1
```

## Exercise 2 — the dependency array is a claim

Edit `ex2/solution.tsx`. `ThemeSync({ theme, onSync, label })` renders the
`label` in a paragraph and calls `onSync(theme)` **once per theme**, not once
per render. The gate re-renders with a changed `label` and an unchanged
`theme`, and requires that no sync happened.

The stub's effect has no dependency array at all.

```
uv run dojo test react 06_effects ex2
```

## Exercise 3 — subscribe, and unsubscribe

Edit `ex3/solution.tsx`. `EscapeToClose({ onClose })` listens for `keydown` on
`document` and calls `onClose` when the pressed key is `Escape` — and only
then. When the component unmounts it must stop listening.

The gate presses Escape after unmounting. A component that is still listening
after it is gone fails, which is exactly what a leak looks like in production.

```
uv run dojo test react 06_effects ex3
```

## Exercise 4 — fetching on mount

Edit `ex4/solution.tsx`. `UserBadge({ userId, fetchUser })` calls
`fetchUser(userId)` and renders the resulting `name` in a paragraph. Before the
promise settles it renders nothing.

`fetchUser` is a **prop**, not an import. Every data-fetching exercise in this
track works that way: the function that talks to the network is injected, so
the gate can hand you a deterministic fake and there is never a real request.
That is also good production design — a component that takes its data source as
a prop is testable, mockable and reusable.

The gate re-renders with the same `userId` and requires that no second request
happens. Getting that wrong is an infinite fetch loop.

```
uv run dojo test react 06_effects ex4
```

## Challenge — the stale closure

Edit `challenge/solution.tsx`. `Stopwatch` is written, compiles, and is wrong.
It renders a live region and `Start` / `Stop` buttons, and while running it
should add one second every second.

Run the gate first and read the failure. Then fix it so that:

- three seconds after Start, the display reads `3`;
- after Stop, time may pass and the display does not move;
- Start again resumes from where it stopped.

Honest difficulty note: the fix is one word. Understanding *why* that word fixes
it is the reason this is the challenge, and the same bug returns as an interview
drill in `i2_interview_drills`.

```
uv run dojo test react 06_effects challenge
```

## Review — cleanup ordering

`review1/solution.tsx`. `AnnounceOnChange({ message, onAnnounce, onClear })`
renders the message in a live region, calls `onAnnounce(message)` when the
message changes, and calls `onClear(message)` to retract it — on the way to the
next message and on unmount.

The gate checks that when the message changes from `Saved` to `Deleted`, the
clear call carries `Saved`.

```
uv run dojo test react 06_effects review1
```

## The gate

This is the entire gate, `gate.test.tsx`:

<!-- GATE:BEGIN -->

```tsx
// Gate for react/06_effects. Quoted verbatim in README.md.
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import { PageTitle } from "./ex1/solution";
import { ThemeSync } from "./ex2/solution";
import { EscapeToClose } from "./ex3/solution";
import { UserBadge } from "./ex4/solution";
import { Stopwatch } from "./challenge/solution";
import { AnnounceOnChange } from "./review1/solution";

afterEach(() => {
  vi.useRealTimers();
});

describe("06_effects", () => {
  test("ex1 - PageTitle sets the document title and puts it back", () => {
    document.title = "Dojo";
    const { rerender, unmount } = render(<PageTitle title="Lesson 06" />);

    expect(
      document.title,
      "the effect has to write the title prop to document.title - reaching " +
        "outside React is exactly what an effect is for (README ex1)",
    ).toBe("Lesson 06");

    rerender(<PageTitle title="Effects" />);
    expect(
      document.title,
      "a new title prop must re-run the effect. An empty dependency array says " +
        "run once and never again, which is not what this component promises",
    ).toBe("Effects");

    unmount();
    expect(
      document.title,
      "on unmount the title must go back to what it was before this component " +
        "existed - that is the cleanup function's job",
    ).toBe("Dojo");
  });

  test("ex2 - ThemeSync tells the outside world only when the theme changes", () => {
    const onSync = vi.fn();
    const { rerender } = render(<ThemeSync theme="light" onSync={onSync} label="A" />);

    expect(onSync, "the effect runs once after the first render").toHaveBeenCalledTimes(1);
    expect(onSync, "and it reports the current theme").toHaveBeenLastCalledWith("light");

    rerender(<ThemeSync theme="light" onSync={onSync} label="B" />);
    expect(
      onSync,
      "the label changed, the theme did not, and this effect is about the " +
        "theme. An effect with no dependency array re-runs after every single " +
        "render - list what it actually depends on (README ex2)",
    ).toHaveBeenCalledTimes(1);

    rerender(<ThemeSync theme="dark" onSync={onSync} label="B" />);
    expect(onSync, "a real theme change must re-run it").toHaveBeenCalledTimes(2);
    expect(onSync, "with the new value").toHaveBeenLastCalledWith("dark");
  });

  test("ex3 - EscapeToClose stops listening once it is gone", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { unmount } = render(<EscapeToClose onClose={onClose} />);

    await user.keyboard("{Escape}");
    expect(
      onClose,
      "pressing Escape anywhere on the page must call onClose - subscribe to " +
        "keydown on the document inside an effect",
    ).toHaveBeenCalledTimes(1);

    await user.keyboard("a");
    expect(onClose, "any other key is none of this component's business").toHaveBeenCalledTimes(1);

    unmount();
    await user.keyboard("{Escape}");
    expect(
      onClose,
      "an unmounted component that is still listening is a leak, and it will " +
        "eventually set state on something that no longer exists. Return a " +
        "cleanup function that removes the listener (README ex3)",
    ).toHaveBeenCalledTimes(1);
  }, 20000);

  test("ex4 - UserBadge fetches on mount and when the id changes", async () => {
    const fetchUser = vi.fn(async (id: string) => ({ name: id === "1" ? "Ada" : "Lin" }));
    const { rerender } = render(<UserBadge userId="1" fetchUser={fetchUser} />);

    expect(
      await screen.findByText("Ada"),
      "the effect calls fetchUser and shows the name once the promise settles",
    ).toBeInTheDocument();
    expect(fetchUser, "exactly one request so far").toHaveBeenCalledTimes(1);

    rerender(<UserBadge userId="1" fetchUser={fetchUser} />);
    expect(
      fetchUser,
      "re-rendering with the same id must not refetch - that is what the " +
        "dependency array is for, and getting it wrong here is an infinite loop " +
        "in production",
    ).toHaveBeenCalledTimes(1);

    rerender(<UserBadge userId="2" fetchUser={fetchUser} />);
    expect(await screen.findByText("Lin"), "a new id must fetch again").toBeInTheDocument();
    expect(fetchUser, "two ids, two requests").toHaveBeenCalledTimes(2);
  });

  test("challenge - Stopwatch counts real seconds, not the same second twice", () => {
    vi.useFakeTimers();
    render(<Stopwatch />);

    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(
      screen.getByRole("status"),
      "after three seconds it should read 3. Reading 1 means every tick added " +
        "one to the same captured value: the interval callback was created " +
        "during one render and keeps that render's seconds forever. Use the " +
        "updater form (README challenge)",
    ).toHaveTextContent("3");

    fireEvent.click(screen.getByRole("button", { name: "Stop" }));
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(
      screen.getByRole("status"),
      "stopped means stopped - the interval has to be cleared",
    ).toHaveTextContent("3");

    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByRole("status"), "starting again resumes from 3").toHaveTextContent("4");
  });

  test("review1 - AnnounceOnChange cleans up before it announces again", () => {
    const onAnnounce = vi.fn();
    const onClear = vi.fn();
    const { rerender, unmount } = render(
      <AnnounceOnChange message="Saved" onAnnounce={onAnnounce} onClear={onClear} />,
    );

    expect(onAnnounce, "announce the first message").toHaveBeenLastCalledWith("Saved");
    expect(onClear, "nothing to clear yet").not.toHaveBeenCalled();

    rerender(<AnnounceOnChange message="Deleted" onAnnounce={onAnnounce} onClear={onClear} />);
    expect(
      onClear,
      "React runs the previous cleanup before the next effect, and the cleanup " +
        "belongs to the render that created it - so it clears the OLD message",
    ).toHaveBeenLastCalledWith("Saved");
    expect(onAnnounce, "then announces the new one").toHaveBeenLastCalledWith("Deleted");

    unmount();
    expect(onClear, "and unmounting clears whatever was last announced").toHaveBeenLastCalledWith(
      "Deleted",
    );
  });
});
```

<!-- GATE:END -->

In plain English:

- **ex1** sets `document.title` to a known value, renders, checks it changed,
  re-renders with a new prop, checks it followed, unmounts, checks it went back.
- **ex2** counts calls to the injected spy across three renders, only one of
  which changed the theme.
- **ex3** presses Escape, presses another key, unmounts, presses Escape again —
  and requires the count to be `1` throughout the last three.
- **ex4** uses `findByText`, which retries until the text appears or times out —
  the standard way to wait for something asynchronous — and counts calls to the
  injected fetcher across a same-id and a changed-id re-render.
- **challenge** uses vitest's fake timers so nothing waits in real time:
  `vi.advanceTimersByTime(3000)` moves the clock three seconds instantly, inside
  `act()` so React processes the resulting state updates. It uses `fireEvent`
  rather than `user-event` for the clicks, because `user-event` waits on real
  timers and mixing the two makes a test that fails on a slow day.
- **review1** checks the *arguments* of the clear call, which is the only way to
  see that a cleanup belongs to the render that created it.

## The teaching point

The mental model to keep: **an effect synchronises an external system with your
component's current state, and the cleanup un-synchronises it.** Not "run this
after render", not "run this when X changes" — those are descriptions of the
mechanism, and they lead you to write effects for things that were never
synchronisation problems.

The dependency array follows from that model rather than being a separate rule.
It lists what the effect *read*, so React knows when re-running it could produce
a different result. When the linter tells you a dependency is missing, it is
almost never wrong; it is telling you your effect is reading something you have
not admitted to, and the honest fixes are to add it, to stop reading it (the
updater form), or to move the value out of the component entirely.

Next: **07_data_fetching**, where two requests come back in the wrong order.
