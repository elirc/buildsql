# d11 — Effect cleanup (drill set)

Eight problems on the second half of every effect: the function it returns.
Subscriptions, intervals, timeouts and document listeners all have the same
shape — something is started that will outlive the render unless the component
stops it. It drills `06_effects`; if "React runs the previous cleanup before the
next effect" is not yet a sentence you could say out loud, reread that lesson
first.

Every external system arrives as a prop and every gate counts what is still
open. The timed drills use fake timers and `fireEvent`, because `user-event`
waits on real timers and the two do not mix.

## Exercise 1 — unsubscribe on the way out

Edit `ex1/solution.tsx`. `PresenceList({ subscribe })` calls
`subscribe(callback)`, which returns an unsubscribe function, and renders one
`<li>` per name the callback is given. Unmounting must unsubscribe exactly once.

```
uv run dojo test react d11_effects_cleanup ex1
```

## Exercise 2 — the interval that outlives its component

Edit `ex2/solution.tsx`. `IntervalClock({ tick })` calls `tick()` once per
second and shows `<n> seconds` in a `role="status"` paragraph. After unmounting,
advancing time must call `tick` no more and leave nothing scheduled.

```
uv run dojo test react d11_effects_cleanup ex2
```

## Exercise 3 — leave before you arrive

Edit `ex3/solution.tsx`. `ChannelSwitch({ channel, connect })` calls
`connect(channel)`, which returns a disconnect function, and renders
`Listening to <channel>` in a `role="status"` paragraph. Switching channels must
produce exactly `connect alpha`, `disconnect alpha`, `connect beta`, and
unmounting must disconnect the last one.

```
uv run dojo test react d11_effects_cleanup ex3
```

## Exercise 4 — start, pause, finish

Edit `ex4/solution.tsx`. `Countdown({ from, onDone })` renders `Start` and
`Pause` buttons and `Time left: <n>` in a `role="status"` paragraph. It counts
down one per second **only while running**, pausing stops it where it is,
reaching zero calls `onDone` exactly once and stops the countdown, and no timer
is left scheduled afterwards.

```
uv run dojo test react d11_effects_cleanup ex4
```

## Exercise 5 — clicks that are somewhere else

Edit `ex5/solution.tsx`. `ClickOutside({ onOutside })` renders a `<div>`
containing a button labelled `Inside`, and listens for clicks on `document`.
Clicks inside its own element call nothing; clicks anywhere else call
`onOutside`. A new `onOutside` prop must replace the old listener, and unmounting
must remove it.

```
uv run dojo test react d11_effects_cleanup ex5
```

## Exercise 6 — save when the typing stops

Edit `ex6/solution.tsx`. `Autosave({ text, save })` calls `save(text)` 500ms
after the last change to `text`, once. A change inside that window cancels the
pending save; unmounting inside it cancels the save entirely. A `role="status"`
paragraph reads `Unsaved changes` between a change and its save, and
`All changes saved` otherwise — including on the first render, when nothing has
changed yet.

```
uv run dojo test react d11_effects_cleanup ex6
```

## Exercise 7 — set up twice, on purpose

Edit `ex7/solution.tsx`. `SessionKeeper({ connect })` calls `connect()`, which
returns a close function, and renders `Session open` in a `role="status"`
paragraph. The gate renders it inside `<StrictMode>`, which in development runs
every effect setup–cleanup–setup: afterwards there must be two setups, one
cleanup and **one** live connection, and unmounting must close it.

```
uv run dojo test react d11_effects_cleanup ex7
```

## Exercise 8 — one stream at a time

Edit `ex8/solution.tsx`. `LiveTicker({ source, paused, subscribe })` calls
`subscribe(source, callback)`, which returns an unsubscribe function, and shows
`<source>: <value>` in a `role="status"` paragraph (`No data` before anything
arrives). It is subscribed only while `paused` is false, resubscribes when
`source` changes, and never has two streams open at once — pausing, resuming,
switching source and unmounting all have to leave the count right. A value that
arrived for one source must never be displayed as another source's.

```
uv run dojo test react d11_effects_cleanup ex8
```

## The gate

This is the entire gate, `gate.test.tsx`:

<!-- GATE:BEGIN -->

```tsx
// Gate for react/d11_effects_cleanup. Quoted verbatim in README.md.
//
// Timer-driven drills use fireEvent and vi.useFakeTimers rather than
// user-event: user-event waits on real timers, and mixing that with fake ones
// makes a test that passes here and fails on a slow machine.
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { PresenceList } from "./ex1/solution";
import { IntervalClock } from "./ex2/solution";
import { ChannelSwitch } from "./ex3/solution";
import { Countdown } from "./ex4/solution";
import { ClickOutside } from "./ex5/solution";
import { Autosave } from "./ex6/solution";
import { SessionKeeper } from "./ex7/solution";
import { LiveTicker } from "./ex8/solution";

afterEach(() => {
  vi.useRealTimers();
});

describe("d11_effects_cleanup", () => {
  test("ex1 - PresenceList stops listening once it is gone", () => {
    const unsubscribe = vi.fn();
    let push: ((names: string[]) => void) | null = null;
    const subscribe = vi.fn((onNames: (names: string[]) => void) => {
      push = onNames;
      return unsubscribe;
    });

    const { unmount } = render(<PresenceList subscribe={subscribe} />);

    expect(
      subscribe,
      "the effect subscribes once after the first render, handing the source a " +
        "way to push names back (README ex1)",
    ).toHaveBeenCalledTimes(1);

    act(() => push!(["Ada", "Bo"]));
    expect(
      screen.queryAllByRole("listitem").map((item) => item.textContent),
      "whatever the source pushes is what the list shows",
    ).toEqual(["Ada", "Bo"]);
    expect(unsubscribe, "nothing has unsubscribed while the list is on screen").not.toHaveBeenCalled();

    unmount();
    expect(
      unsubscribe,
      "a subscription that outlives its component is a leak: the source keeps " +
        "the callback alive and keeps pushing into a component that no longer " +
        "exists. The effect has to return the unsubscribe function it was given",
    ).toHaveBeenCalledTimes(1);
  });

  test("ex2 - IntervalClock stops ticking when it is unmounted", () => {
    vi.useFakeTimers();
    const tick = vi.fn();
    const { unmount } = render(<IntervalClock tick={tick} />);

    expect(tick, "no time has passed yet").not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(tick, "three seconds is three ticks").toHaveBeenCalledTimes(3);
    expect(screen.getByRole("status"), "and the count is on screen").toHaveTextContent("3 seconds");

    unmount();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(
      tick,
      "the component is gone and the interval is still running - that is a " +
        "leak with a heartbeat. Clear it in the cleanup (README ex2)",
    ).toHaveBeenCalledTimes(3);
    expect(vi.getTimerCount(), "with nothing left scheduled either").toBe(0);
  });

  test("ex3 - ChannelSwitch disconnects the old channel before connecting the new one", () => {
    const log: string[] = [];
    const connect = vi.fn((channel: string) => {
      log.push(`connect ${channel}`);
      return () => log.push(`disconnect ${channel}`);
    });

    const { rerender, unmount } = render(<ChannelSwitch channel="alpha" connect={connect} />);

    expect(log, "one connection on mount").toEqual(["connect alpha"]);
    expect(screen.getByRole("status")).toHaveTextContent("Listening to alpha");

    rerender(<ChannelSwitch channel="beta" connect={connect} />);
    expect(
      log,
      "React runs the previous effect-s cleanup before the next effect, so the " +
        "order is fixed: leave alpha, then join beta. Connecting first and " +
        "disconnecting afterwards is how you end up disconnecting the channel " +
        "you just joined (README ex3)",
    ).toEqual(["connect alpha", "disconnect alpha", "connect beta"]);

    unmount();
    expect(log, "and the last channel is left on the way out").toEqual([
      "connect alpha",
      "disconnect alpha",
      "connect beta",
      "disconnect beta",
    ]);
  });

  test("ex4 - Countdown counts only while it is running and finishes once", () => {
    vi.useFakeTimers();
    const onDone = vi.fn();
    render(<Countdown from={3} onDone={onDone} />);

    expect(screen.getByRole("status"), "it starts at the number it was given").toHaveTextContent(
      "Time left: 3",
    );

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(
      screen.getByRole("status"),
      "nothing counts down before Start is pressed",
    ).toHaveTextContent("Time left: 3");

    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByRole("status"), "two seconds off three leaves one").toHaveTextContent(
      "Time left: 1",
    );

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(
      screen.getByRole("status"),
      "paused means the interval is actually cleared. An effect that starts a " +
        "timer without returning a way to stop it leaves one running per Start " +
        "you ever pressed (README ex4)",
    ).toHaveTextContent("Time left: 1");
    expect(onDone, "and nothing finished while it was paused").not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByRole("status"), "resuming spends the last second").toHaveTextContent(
      "Time left: 0",
    );
    expect(onDone, "reaching zero finishes, exactly once").toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onDone, "a finished countdown is not still counting").toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount(), "and it has no timer left running").toBe(0);
  });

  test("ex5 - ClickOutside hears the right clicks and stops when it leaves", async () => {
    const user = userEvent.setup();
    const first = vi.fn();
    const second = vi.fn();

    const { rerender, unmount } = render(
      <>
        <ClickOutside onOutside={first} />
        <button type="button">Somewhere else</button>
      </>,
    );

    await user.click(screen.getByRole("button", { name: "Inside" }));
    expect(
      first,
      "a click on the component-s own content is not a click outside it - " +
        "compare the event target against the element you rendered (README ex5)",
    ).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Somewhere else" }));
    expect(first, "a click anywhere else is").toHaveBeenCalledTimes(1);

    rerender(
      <>
        <ClickOutside onOutside={second} />
        <button type="button">Somewhere else</button>
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Somewhere else" }));
    expect(
      second,
      "the callback changed, so the listener has to change with it. A listener " +
        "registered once with an empty dependency array keeps calling the " +
        "function from the first render forever - a stale closure",
    ).toHaveBeenCalledTimes(1);
    expect(first, "and the old callback must not be called again").toHaveBeenCalledTimes(1);

    unmount();
    await user.click(document.body);
    expect(
      second,
      "a document listener that outlives its component keeps firing, and every " +
        "mount adds another one",
    ).toHaveBeenCalledTimes(1);
  }, 30000);

  test("ex6 - Autosave waits for the typing to stop and saves once", () => {
    vi.useFakeTimers();
    const save = vi.fn();
    const { rerender, unmount } = render(<Autosave text="Hello" save={save} />);

    expect(
      screen.getByRole("status"),
      "nothing has changed since it mounted, so: All changes saved",
    ).toHaveTextContent("All changes saved");
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(save, "and an untouched document is never saved").not.toHaveBeenCalled();

    rerender(<Autosave text="Hello w" save={save} />);
    expect(screen.getByRole("status"), "a change is unsaved until it is saved").toHaveTextContent(
      "Unsaved changes",
    );
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(save, "400ms is not 500ms").not.toHaveBeenCalled();

    rerender(<Autosave text="Hello world" save={save} />);
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(
      save,
      "a change inside the window cancels the save that was about to go out. " +
        "That cancellation is the cleanup clearing the pending timeout, which " +
        "is the whole mechanism of a debounce (README ex6)",
    ).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(save, "500ms after the last change, one save").toHaveBeenCalledTimes(1);
    expect(save, "with the text as it stands now").toHaveBeenLastCalledWith("Hello world");
    expect(screen.getByRole("status")).toHaveTextContent("All changes saved");

    rerender(<Autosave text="Hello world!" save={save} />);
    expect(screen.getByRole("status")).toHaveTextContent("Unsaved changes");
    act(() => {
      vi.advanceTimersByTime(200);
    });
    unmount();
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(
      save,
      "unmounting inside the window cancels the pending save too - the cleanup " +
        "runs on the way out as well as between runs",
    ).toHaveBeenCalledTimes(1);
  });

  test("ex7 - SessionKeeper survives being set up twice", () => {
    let live = 0;
    const opened = vi.fn();
    const closed = vi.fn();
    const connect = () => {
      live += 1;
      opened();
      return () => {
        live -= 1;
        closed();
      };
    };

    const { unmount } = render(
      <StrictMode>
        <SessionKeeper connect={connect} />
      </StrictMode>,
    );

    expect(
      opened,
      "in development StrictMode runs every effect twice on mount - setup, " +
        "cleanup, setup - to prove the pair is symmetrical (README ex7)",
    ).toHaveBeenCalledTimes(2);
    expect(
      closed,
      "so there must be exactly one cleanup in between. Zero means the effect " +
        "returned nothing, and in production that same asymmetry opens a " +
        "connection nobody ever closes",
    ).toHaveBeenCalledTimes(1);
    expect(live, "which leaves exactly one live connection, not two").toBe(1);
    expect(screen.getByRole("status")).toHaveTextContent("Session open");

    unmount();
    expect(closed, "and unmounting closes the one that was left").toHaveBeenCalledTimes(2);
    expect(live, "leaving none behind").toBe(0);
  });

  test("ex8 - LiveTicker holds one subscription, and only while it should", () => {
    let live = 0;
    const opened: string[] = [];
    let push: ((value: number) => void) | null = null;
    const subscribe = vi.fn((source: string, onValue: (value: number) => void) => {
      live += 1;
      opened.push(source);
      push = onValue;
      return () => {
        live -= 1;
      };
    });

    const { rerender, unmount } = render(
      <LiveTicker source="eu" paused={false} subscribe={subscribe} />,
    );

    expect(opened, "one subscription, to the source it was given").toEqual(["eu"]);
    expect(live, "and it is open").toBe(1);

    act(() => push!(42));
    expect(screen.getByRole("status"), "values that arrive are shown").toHaveTextContent("eu: 42");

    rerender(<LiveTicker source="eu" paused={true} subscribe={subscribe} />);
    expect(
      live,
      "pausing has to close the stream, not merely ignore it. The cleanup is " +
        "the only thing that can, so the effect has to re-run when paused " +
        "changes (README ex8)",
    ).toBe(0);
    expect(opened, "and pausing subscribes to nothing new").toEqual(["eu"]);

    rerender(<LiveTicker source="eu" paused={false} subscribe={subscribe} />);
    expect(opened, "resuming opens it again").toEqual(["eu", "eu"]);
    expect(live, "one stream, not two").toBe(1);

    rerender(<LiveTicker source="us" paused={false} subscribe={subscribe} />);
    expect(opened, "a new source is a new subscription").toEqual(["eu", "eu", "us"]);
    expect(
      live,
      "and the old one closed on the way, so there is still exactly one open",
    ).toBe(1);

    act(() => push!(7));
    expect(screen.getByRole("status")).toHaveTextContent("us: 7");

    unmount();
    expect(live, "unmounting leaves nothing open").toBe(0);
  });
});
```

<!-- GATE:END -->

Next: **d12_fetching_states**, where the thing being cleaned up is a request
whose answer you no longer want.
