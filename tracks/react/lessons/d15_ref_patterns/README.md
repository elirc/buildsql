# d15 — Ref patterns (drill set)

Eight problems on `useRef`'s **other** job: a box that survives re-renders and
never causes one. Not a single ref in this set points at a DOM node — that was
`d14_refs_dom`. It drills `08_refs_dom`, and the sentence to have in your head
before you start is that lesson's rule: if changing it should change what is on
screen it is state, and if it should not, it is a ref.

Three of the eight are about the sharpest form of that question — a value the
code must read *now*, before the next render can possibly happen. Two are
`useImperativeHandle`: choosing what a parent is allowed to do to you. The rest
are the classic traps, including the one where a ref is exactly the wrong tool.

## Exercise 1 — what it showed a moment ago

Edit `ex1/solution.tsx`. `PressureGauge({ label, reading })` renders
`<label>: now <reading>, was <previous>` in a `role="status"` paragraph, where
`previous` is the reading from the render before this one, or the words
`nothing yet` on the very first render. The gate puts **two** gauges on screen
at once, which the stub's module-level variable cannot survive.

```
uv run dojo test react d15_ref_patterns ex1
```

## Exercise 2 — report it once, ever

Edit `ex2/solution.tsx`. `ImpressionBeacon({ slotId, report })` renders
`Showing <slotId>` in a paragraph and calls `report(slotId)` the first time it
shows a given slot. A slot this component has already reported is never
reported again, even after showing something else and coming back to it.

```
uv run dojo test react d15_ref_patterns ex2
```

## Exercise 3 — three verbs and nothing else

Edit `ex3/solution.tsx`. `MediaScrubber({ label, ref })` renders
`<label>: playing|paused at <position>s` in a `role="status"` paragraph,
starting paused at `0`. A parent holding the ref gets exactly
`{ play(), pause(), seek(seconds) }` — no DOM node — and each method changes
what the component shows. The stub already exposes the three methods; their
bodies are empty.

```
uv run dojo test react d15_ref_patterns ex3
```

## Exercise 4 — one connection, the newest handler

Edit `ex4/solution.tsx`. `PingMonitor({ subscribe, onMessage })` calls
`subscribe(handler)` **once** and returns the unsubscribe function it is given
as the effect's cleanup. It renders `Messages: <n>` in a `role="status"`
paragraph, counting what has arrived, and every message goes to the `onMessage`
the component has *now* — even though the parent passes a new function on every
render and the subscription must not be reopened.

```
uv run dojo test react d15_ref_patterns ex4
```

## Exercise 5 — the second click of a double-click

Edit `ex5/solution.tsx`. `PayoutRequest({ onSubmit })` renders a
`Request payout` button and a `role="status"` paragraph reading `Ready` or
`Sending`. A click calls `onSubmit()`, which returns a promise; while it is in
flight the button is disabled. The gate dispatches two clicks inside one
`act()`, before React has re-rendered anything, and exactly one payout may go
out — but a click after the first has settled must work normally.

```
uv run dojo test react d15_ref_patterns ex5
```

## Exercise 6 — a ref for them, a ref for you

Edit `ex6/solution.tsx`. `PassphraseBox({ label, ref })` renders an input
labelled `label` and a button named `Clear <label>` which empties the field and
focuses it. The optional `ref` prop must reach the input, so a parent can focus
it — and `Clear` must work just as well on a box nobody passed a ref to.

```
uv run dojo test react d15_ref_patterns ex6
```

## Exercise 7 — created once, closed once

Edit `ex7/solution.tsx`. `AnalyticsSession({ label, createSession })` calls
`createSession()` **exactly once per mount**, no matter how many times it
renders, and calls the returned session's `close()` exactly once when it
unmounts. It renders `label` in a paragraph, `Session <id>, Events: <n>` in a
`role="status"` paragraph, and a `Bump` button that adds one to `n`.

```
uv run dojo test react d15_ref_patterns ex7
```

## Exercise 8 — a handle that is not out of date

Edit `ex8/solution.tsx`. `ScratchPad({ label, ref })` renders a `<textarea>`
labelled `label`, controlled by state. A parent holding the ref gets
`{ read(), insert(extra), clear() }`: `read` returns the text as it is right
now, `insert` appends to it, `clear` empties it. Two pads on one page know
nothing about each other.

```
uv run dojo test react d15_ref_patterns ex8
```

## The gate

This is the entire gate, `gate.test.tsx`:

<!-- GATE:BEGIN -->

```tsx
// Gate for react/d15_ref_patterns. Quoted verbatim in README.md.
//
// Not one ref in this file points at a DOM node. Everything here is the other
// job: a box that survives a render without causing one, and the handles a
// component chooses to expose.
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, test, vi } from "vitest";

import { PressureGauge } from "./ex1/solution";
import { ImpressionBeacon } from "./ex2/solution";
import { MediaScrubber, type ScrubberHandle } from "./ex3/solution";
import { PingMonitor } from "./ex4/solution";
import { PayoutRequest } from "./ex5/solution";
import { PassphraseBox } from "./ex6/solution";
import { AnalyticsSession, type Session } from "./ex7/solution";
import { ScratchPad, type PadHandle } from "./ex8/solution";

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

const texts = (role: string) => screen.queryAllByRole(role).map((node) => node.textContent);

describe("d15_ref_patterns", () => {
  test("ex1 - PressureGauge remembers what it showed a render ago", () => {
    const { rerender } = render(
      <>
        <PressureGauge label="Boiler" reading={41} />
        <PressureGauge label="Feed" reading={20} />
      </>,
    );

    expect(
      texts("status"),
      "on the first render there is no previous reading, and each gauge has to " +
        "answer that for itself. A variable at module scope is shared by every " +
        "instance of a component, which is why the second gauge starts out " +
        "knowing the first one-s number (README ex1)",
    ).toEqual(["Boiler: now 41, was nothing yet", "Feed: now 20, was nothing yet"]);

    rerender(
      <>
        <PressureGauge label="Boiler" reading={44} />
        <PressureGauge label="Feed" reading={20} />
      </>,
    );
    expect(
      texts("status"),
      "one render later, each gauge reports the number it was showing before - " +
        "including the one whose reading did not move",
    ).toEqual(["Boiler: now 44, was 41", "Feed: now 20, was 20"]);

    rerender(
      <>
        <PressureGauge label="Boiler" reading={39} />
        <PressureGauge label="Feed" reading={22} />
      </>,
    );
    expect(texts("status"), "and again").toEqual([
      "Boiler: now 39, was 44",
      "Feed: now 22, was 20",
    ]);
  }, 30000);

  test("ex2 - ImpressionBeacon reports a slot the first time and only the first time", () => {
    const report = vi.fn();
    const { rerender } = render(<ImpressionBeacon slotId="hero" report={report} />);

    expect(report, "a slot on screen for the first time is reported").toHaveBeenCalledTimes(1);
    expect(report).toHaveBeenLastCalledWith("hero");

    rerender(<ImpressionBeacon slotId="hero" report={report} />);
    expect(report, "the same slot again is not a new impression").toHaveBeenCalledTimes(1);

    rerender(<ImpressionBeacon slotId="sidebar" report={report} />);
    expect(report, "a slot nobody has seen is").toHaveBeenCalledTimes(2);
    expect(report).toHaveBeenLastCalledWith("sidebar");
    expect(screen.queryByText("Showing sidebar"), "and it is on screen").not.toBeNull();

    rerender(<ImpressionBeacon slotId="hero" report={report} />);
    expect(
      report,
      "coming back to a slot this component has already reported is not a new " +
        "impression either, and billing somebody twice for one view is the bug. " +
        "The effect needs a memory of what it has already done, and that memory " +
        "must not itself cause a render (README ex2)",
    ).toHaveBeenCalledTimes(2);
  }, 30000);

  test("ex3 - MediaScrubber is driven entirely from outside", () => {
    const first = createRef<ScrubberHandle>();
    const second = createRef<ScrubberHandle>();
    render(
      <>
        <MediaScrubber label="Interview" ref={first} />
        <MediaScrubber label="Outtakes" ref={second} />
      </>,
    );

    expect(texts("status"), "both start where they start").toEqual([
      "Interview: paused at 0s",
      "Outtakes: paused at 0s",
    ]);

    act(() => first.current?.play());
    expect(
      texts("status"),
      "the parent holds an object of your design, not a DOM node - and calling " +
        "a method on it has to change what the component shows, which a node " +
        "could never do (README ex3)",
    ).toEqual(["Interview: playing at 0s", "Outtakes: paused at 0s"]);

    act(() => first.current?.seek(30));
    expect(texts("status"), "seeking moves the position and nothing else").toEqual([
      "Interview: playing at 30s",
      "Outtakes: paused at 0s",
    ]);

    act(() => first.current?.pause());
    act(() => second.current?.play());
    expect(
      texts("status"),
      "and two scrubbers are two independent components, each with its own state",
    ).toEqual(["Interview: paused at 30s", "Outtakes: playing at 0s"]);
  }, 30000);

  test("ex4 - PingMonitor subscribes once and still calls the newest handler", () => {
    const unsubscribe = vi.fn();
    let push: ((message: string) => void) | null = null;
    const subscribe = vi.fn((handler: (message: string) => void) => {
      push = handler;
      return unsubscribe;
    });
    const first = vi.fn();
    const second = vi.fn();

    const { rerender, unmount } = render(
      <PingMonitor subscribe={subscribe} onMessage={first} />,
    );
    expect(subscribe, "one subscription on mount").toHaveBeenCalledTimes(1);

    act(() => push!("ping 1"));
    expect(first, "and what arrives goes to the handler").toHaveBeenLastCalledWith("ping 1");
    expect(screen.getByRole("status"), "the count follows").toHaveTextContent("Messages: 1");

    rerender(<PingMonitor subscribe={subscribe} onMessage={second} />);
    expect(
      subscribe,
      "the parent handed over a new function, which is not a reason to tear " +
        "down a live connection and open another one. Putting the callback in " +
        "the dependency array does exactly that, on every single render " +
        "(README ex4)",
    ).toHaveBeenCalledTimes(1);
    expect(unsubscribe, "and nothing was closed").not.toHaveBeenCalled();

    act(() => push!("ping 2"));
    expect(
      second,
      "but the message must reach the handler the component has now. An effect " +
        "that keeps the callback out of its dependencies calls the one from the " +
        "first render forever - a stale closure",
    ).toHaveBeenLastCalledWith("ping 2");
    expect(first, "and not the one it used to have").toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent("Messages: 2");

    unmount();
    expect(unsubscribe, "leaving closes the connection, once").toHaveBeenCalledTimes(1);
  }, 30000);

  test("ex5 - PayoutRequest cannot be double-clicked into paying twice", async () => {
    const slots = [deferred<void>(), deferred<void>()];
    let index = 0;
    const onSubmit = vi.fn(() => slots[index++].promise);
    render(<PayoutRequest onSubmit={onSubmit} />);

    const button = () => screen.getByRole("button", { name: "Request payout" });
    expect(screen.getByRole("status"), "nothing is happening yet").toHaveTextContent("Ready");

    act(() => {
      fireEvent.click(button());
      fireEvent.click(button());
    });
    expect(
      onSubmit,
      "both clicks land before React has re-rendered anything, so both of them " +
        "read the same state and both see it as false. A disabled attribute " +
        "that arrives one render late does not exist yet at the moment of the " +
        "second click - the guard has to be written the instant the first click " +
        "is handled (README ex5)",
    ).toHaveBeenCalledTimes(1);
    expect(button(), "and now the button is closed for business").toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Sending");

    await settle(slots[0].promise, () => slots[0].resolve());
    expect(button(), "when it finishes the button comes back").toBeEnabled();
    expect(screen.getByRole("status")).toHaveTextContent("Ready");

    act(() => {
      fireEvent.click(button());
    });
    expect(
      onSubmit,
      "and a second payout, later, is a perfectly reasonable thing to want - " +
        "the guard is a door, not a lock",
    ).toHaveBeenCalledTimes(2);
  }, 30000);

  test("ex6 - PassphraseBox works with a ref and works without one", async () => {
    const user = userEvent.setup();
    const vault = createRef<HTMLInputElement>();
    render(
      <>
        <PassphraseBox label="Vault" ref={vault} />
        <PassphraseBox label="Backup" />
      </>,
    );

    act(() => vault.current?.focus());
    expect(screen.getByLabelText("Vault"), "the parent-s ref reaches the input").toHaveFocus();
    await user.type(screen.getByLabelText("Vault"), "opensesame");
    await user.click(screen.getByRole("button", { name: "Clear Vault" }));
    expect(screen.getByLabelText("Vault"), "and Clear empties it").toHaveValue("");

    await user.type(screen.getByLabelText("Backup"), "hunter2");
    await user.click(screen.getByRole("button", { name: "Clear Backup" }));
    expect(
      screen.getByLabelText("Backup"),
      "nobody passed a ref to this one, and a component whose own behaviour " +
        "depends on being handed a ref is broken exactly when it is used " +
        "normally. Keep a ref of your own and give the node to both (README ex6)",
    ).toHaveValue("");
    expect(screen.getByLabelText("Vault"), "and the other box is untouched").toHaveValue("");
  }, 30000);

  test("ex7 - AnalyticsSession is opened once and closed once", async () => {
    const user = userEvent.setup();
    const close = vi.fn();
    let made = 0;
    const createSession = vi.fn((): Session => {
      made += 1;
      return { id: `s${made}`, close };
    });

    const { rerender, unmount } = render(
      <AnalyticsSession label="Checkout" createSession={createSession} />,
    );
    expect(screen.getByRole("status"), "the session it opened is the one it shows").toHaveTextContent(
      "Session s1",
    );
    expect(createSession, "one mount, one session").toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Bump" }));
    await user.click(screen.getByRole("button", { name: "Bump" }));
    expect(screen.getByRole("status"), "the counter counts").toHaveTextContent("Events: 2");
    expect(
      createSession,
      "useRef(createSession()) calls createSession on every render and then " +
        "throws all but the first result away - the argument is evaluated " +
        "before useRef ever runs. Opening a connection per keystroke is not " +
        "something a test has to catch for you to regret it (README ex7)",
    ).toHaveBeenCalledTimes(1);

    rerender(<AnalyticsSession label="Payment" createSession={createSession} />);
    expect(screen.queryByText("Payment"), "a new label renders").not.toBeNull();
    expect(createSession, "and is still not a new session").toHaveBeenCalledTimes(1);
    expect(close, "nothing has been closed while it is on screen").not.toHaveBeenCalled();

    unmount();
    expect(close, "and leaving closes it exactly once").toHaveBeenCalledTimes(1);
  }, 30000);

  test("ex8 - ScratchPad hands out a handle that knows the current text", async () => {
    const user = userEvent.setup();
    const notes = createRef<PadHandle>();
    const other = createRef<PadHandle>();
    render(
      <>
        <ScratchPad label="Notes" ref={notes} />
        <ScratchPad label="Other" ref={other} />
      </>,
    );

    await user.type(screen.getByLabelText("Notes"), "Buy beans");
    expect(
      notes.current?.read(),
      "the handle is built once with an empty dependency array, so read() is a " +
        "closure over the text as it was on the first render - for ever. The " +
        "list of dependencies matters here exactly as much as it does in an " +
        "effect (README ex8)",
    ).toBe("Buy beans");

    act(() => notes.current?.insert(" and milk"));
    expect(screen.getByLabelText("Notes"), "inserting shows up on screen").toHaveValue(
      "Buy beans and milk",
    );
    expect(notes.current?.read(), "and the handle agrees with the screen").toBe(
      "Buy beans and milk",
    );

    expect(other.current?.read(), "the second pad has its own text").toBe("");
    act(() => other.current?.insert("Ideas"));
    expect(screen.getByLabelText("Other")).toHaveValue("Ideas");
    expect(screen.getByLabelText("Notes"), "and neither pad can see the other").toHaveValue(
      "Buy beans and milk",
    );

    act(() => notes.current?.clear());
    expect(screen.getByLabelText("Notes"), "clearing empties this one").toHaveValue("");
    expect(notes.current?.read()).toBe("");
    expect(screen.getByLabelText("Other"), "and only this one").toHaveValue("Ideas");
  }, 30000);
});
```

<!-- GATE:END -->

Next: **d16_context**, where the value being passed around is not held by any
one component at all.
