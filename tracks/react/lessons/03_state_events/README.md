# 03 — State and events

Everything you have written so far is a pure function of its props. Give it the
same input twice and you get the same markup twice, which is lovely and also
means nothing on the page can ever *change*. A counter has to remember its
count between clicks. A toggle has to remember it is on. That memory is
**state**, and this is the lesson where components come alive.

The instinct almost everyone has first is to reach for a variable:

```tsx
function Counter() {
  let count = 0;                                  // this does not work
  return <button onClick={() => count++}>{count}</button>;
}
```

Two separate things are wrong. The variable is recreated every time React calls
the function, so it forgets. And even if it did not, incrementing it tells
React nothing — React re-renders when you *ask* it to, not when a variable
somewhere changes value. `useState` fixes both at once: it stores a value
outside the function call, and its setter is the request to render again.

The subtle part — the part that generates interview questions and production
bugs in equal measure — is what happens to that value *during* a render. It is
a snapshot. It does not change under your feet, even inside an async callback
that runs much later. Once you have that, `setCount(count + 1)` twice giving
`+1` stops being a mystery and becomes obvious.

## Concept — state is a snapshot, and updates are queued

```tsx
import { useState } from "react";

function Seat() {
  const [taken, setTaken] = useState(false);

  return (
    <button type="button" aria-pressed={taken} onClick={() => setTaken(!taken)}>
      Seat 4B
    </button>
  );
}
```

`useState(initial)` returns exactly two things: **the value for this render**,
and a **setter**. The initial value is used only on the first render of that
component instance; after that React hands back whatever it is holding.

Now the important half. Consider:

```tsx
function handleClick() {
  setCount(count + 1);
  setCount(count + 1);
}
```

If `count` is `0`, this is `setCount(1)` followed by `setCount(1)`. Both calls
read the same `count`, because `count` is a `const` belonging to *this* render
and nothing that happens in the handler can change it. React queues two
identical instructions and the counter moves by one.

The fix is the **updater form** — pass a function, and React calls it with the
value the previous queued update produced:

```tsx
function handleClick() {
  setCount((previous) => previous + 1);
  setCount((previous) => previous + 1);
}
```

Now the queue reads "add one, add one" instead of "become 1, become 1". The
rule of thumb: **if the next state is computed from the current state, use the
updater form.** It costs nothing and it is right in the cases where the direct
form is wrong — multiple updates in one handler, updates from a timeout or a
promise, updates from an event that fired while a render was in flight.

**Batching** is the other side of the same coin. React does not re-render
between your setter calls. It collects every update produced by one event,
applies them together, and renders once — so three `useState` values changing
in one handler cost one render, not three. Since React 18 this applies to
updates from promises, `setTimeout` and native event handlers too, not only
React's own events.

**State must be replaced, never mutated.** React decides whether to re-render
by comparing the new value with the old using `Object.is`. Push onto an array
you are already holding and the reference is unchanged, so React concludes
nothing happened:

```tsx
setItems((previous) => [...previous, item]);       // yes
items.push(item); setItems(items);                 // renders nothing
```

Finally, a small accessibility habit the gates enforce. A number that changes
because the user did something should live in a **live region** so screen-reader
users hear the result of their click. The `<output>` element has `role="status"`
built in, which is why it shows up throughout this lesson.

## Exercise 1 — your first state

Edit `ex1/solution.tsx`. `Counter` renders a button whose accessible name is
`Increment` and a live region showing the current count, starting at `0`. Each
click adds one.

```
uv run dojo test react 03_state_events ex1
```

## Exercise 2 — two updates, one click

Edit `ex2/solution.tsx`. `DoubleTap` renders a button named `Add two` and a
live region. **One click must add two.**

The stub already does the obvious thing — it calls the setter twice — and gets
`1`. Do not fix it by calling `setCount(count + 2)`; the requirement is that
the handler makes two separate increments and that both of them land. That
constraint is artificial here and completely real the moment two different
pieces of code both want to bump the same counter during one event.

```
uv run dojo test react 03_state_events ex2
```

## Exercise 3 — a toggle that announces itself

Edit `ex3/solution.tsx`. `LikeButton` renders one button whose accessible name
is always `Like` and which carries `aria-pressed="false"` initially,
`aria-pressed="true"` after a click, and back again after another.

Note what is *not* asked for: changing the label to "Unlike". A toggle button
keeps its name and reports its state separately — swapping the name makes a
screen reader announce what sounds like a different control appearing where the
old one was.

```
uv run dojo test react 03_state_events ex3
```

## Exercise 4 — three states, one render

Edit `ex4/solution.tsx`. `BatchProbe` holds three counters and renders them as
`a-b-c`. Write the click handler so that one press of `Bump all` moves all
three.

The component also takes an `onRender` prop and calls it while rendering. That
is a **probe**: the gate counts the calls to find out how many times your
component rendered. It is already wired up — leave it alone, do not add another
call, and do not copy the trick into real code, where calling a prop during
render is a side effect and therefore a bug.

The gate asserts that one click produces exactly **one** extra render. Write
the obvious three lines, watch it pass, and then read the assertion again —
that number is the lesson.

```
uv run dojo test react 03_state_events ex4
```

## Challenge — undo

Edit `challenge/solution.tsx`. `UndoableCounter` renders a live region and
three buttons: `Increment`, `Decrement` and `Undo`. Undo steps the displayed
value back to what it was before the last change, repeatedly, all the way to
the starting `0`. When there is nothing left to undo, the Undo button is
`disabled`.

Honest difficulty note: no new API is involved — this is entirely a question of
choosing what to store. If you find yourself wanting a second `useState` for
"the previous value", keep going; that only buys you one step.

```
uv run dojo test react 03_state_events challenge
```

## Review — clamping

`review1/solution.tsx`. `Thermostat({ min, max })` starts at `min` and renders
buttons `Warmer` and `Cooler` that move the temperature by one degree, never
leaving the range. The live region shows the temperature followed by `°C`.

```
uv run dojo test react 03_state_events review1
```

## The gate

This is the entire gate, `gate.test.tsx`:

<!-- GATE:BEGIN -->

```tsx
// Gate for react/03_state_events. Quoted verbatim in README.md.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { Counter } from "./ex1/solution";
import { DoubleTap } from "./ex2/solution";
import { LikeButton } from "./ex3/solution";
import { BatchProbe } from "./ex4/solution";
import { UndoableCounter } from "./challenge/solution";
import { Thermostat } from "./review1/solution";

describe("03_state_events", () => {
  test("ex1 - Counter starts at zero and counts clicks", async () => {
    const user = userEvent.setup();
    render(<Counter />);

    expect(
      screen.queryByRole("status"),
      "the count needs a live region so a screen reader hears it change - an " +
        '<output> element, or any element with role="status" (README ex1)',
    ).toHaveTextContent("0");

    const button = screen.getByRole("button", { name: "Increment" });
    await user.click(button);
    expect(
      screen.getByRole("status"),
      "one click, one increment. If this still says 0, the handler is either " +
        "not wired to onClick or is mutating a plain variable instead of state",
    ).toHaveTextContent("1");

    await user.click(button);
    await user.click(button);
    expect(screen.getByRole("status"), "three clicks total should show 3").toHaveTextContent("3");
  });

  test("ex2 - DoubleTap adds two per click by calling the setter twice", async () => {
    const user = userEvent.setup();
    render(<DoubleTap />);

    const button = screen.getByRole("button", { name: "Add two" });
    await user.click(button);
    expect(
      screen.getByRole("status"),
      "showing 1 means both setter calls read the same stale count and wrote " +
        "the same value. Pass a function to the setter so the second call sees " +
        "what the first one wrote - reread README ex2",
    ).toHaveTextContent("2");

    await user.click(button);
    expect(screen.getByRole("status"), "a second click should take it to 4").toHaveTextContent("4");
  });

  test("ex3 - LikeButton reports its own pressed state", async () => {
    const user = userEvent.setup();
    render(<LikeButton />);

    expect(
      screen.queryByRole("button", { pressed: false }),
      'a toggle button announces its state with aria-pressed, and starts unpressed',
    ).not.toBeNull();

    const button = screen.getByRole("button", { name: "Like" });
    await user.click(button);
    expect(
      button,
      'after one click the button must carry aria-pressed="true" - the label ' +
        "stays Like, because the state lives in the attribute, not in the text",
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      button,
      "changing the accessible name on toggle would make a screen reader " +
        "announce a different control - keep it Like",
    ).toHaveAccessibleName("Like");

    await user.click(button);
    expect(button, "clicking again must un-press it").toHaveAttribute("aria-pressed", "false");
  });

  test("ex4 - BatchProbe updates three states in one render", async () => {
    const user = userEvent.setup();
    const onRender = vi.fn();
    render(<BatchProbe onRender={onRender} />);

    expect(screen.getByRole("status"), "all three counters start at zero").toHaveTextContent(
      "0-0-0",
    );
    const rendersAfterMount = onRender.mock.calls.length;

    await user.click(screen.getByRole("button", { name: "Bump all" }));
    expect(
      screen.getByRole("status"),
      "one click must move all three counters - the handler owes the page " +
        "three state updates",
    ).toHaveTextContent("1-1-1");
    expect(
      onRender.mock.calls.length - rendersAfterMount,
      "three state updates inside one event handler are batched into a single " +
        "re-render. More than one extra render here means the updates were split " +
        "across handlers or an effect - reread README ex4",
    ).toBe(1);
  });

  test("challenge - UndoableCounter can walk back through its own history", async () => {
    const user = userEvent.setup();
    render(<UndoableCounter />);

    const up = screen.getByRole("button", { name: "Increment" });
    const down = screen.getByRole("button", { name: "Decrement" });
    const undo = screen.getByRole("button", { name: "Undo" });

    expect(undo, "at the start there is nothing to undo, so Undo is disabled").toBeDisabled();

    await user.click(up);
    await user.click(up);
    await user.click(down);
    expect(screen.getByRole("status"), "up, up, down should read 1").toHaveTextContent("1");

    await user.click(undo);
    expect(
      screen.getByRole("status"),
      "one undo steps back to the value before the last change, which was 2. " +
        "Storing only the current number cannot do this - the state has to " +
        "remember more than one value (README challenge)",
    ).toHaveTextContent("2");

    await user.click(undo);
    await user.click(undo);
    expect(screen.getByRole("status"), "three undos land back on the initial 0").toHaveTextContent(
      "0",
    );
    expect(undo, "back at the start, Undo is disabled again").toBeDisabled();
  }, 20000);

  test("review1 - Thermostat clamps to its own range", async () => {
    const user = userEvent.setup();
    render(<Thermostat min={18} max={21} />);

    expect(screen.getByRole("status"), "the thermostat starts at min").toHaveTextContent("18");

    const warmer = screen.getByRole("button", { name: "Warmer" });
    await user.click(warmer);
    await user.click(warmer);
    expect(screen.getByRole("status"), "two degrees up from 18 is 20").toHaveTextContent("20");

    await user.click(warmer);
    await user.click(warmer);
    await user.click(warmer);
    expect(
      screen.getByRole("status"),
      "the temperature may never go above max - clamp inside the updater, " +
        "where you can see the value you are about to write",
    ).toHaveTextContent("21");

    const cooler = screen.getByRole("button", { name: "Cooler" });
    for (let i = 0; i < 6; i++) {
      await user.click(cooler);
    }
    expect(screen.getByRole("status"), "and never below min either").toHaveTextContent("18");
  }, 20000);
});
```

<!-- GATE:END -->

In plain English:

- **ex1** checks the initial `0`, clicks once and checks `1`, clicks twice more
  and checks `3`. `toHaveTextContent` does a substring match, so the live
  region may contain other text around the number.
- **ex2** clicks once and requires `2` — the whole exercise is that assertion —
  then clicks again for `4` to rule out a component that just doubles whatever
  it is given.
- **ex3** uses `getByRole("button", { pressed: false })`, a query that filters
  on the ARIA state rather than the markup, then checks the attribute directly
  after each click and re-checks the accessible name.
- **ex4** records how many times `onRender` had been called after mounting,
  clicks once, and requires the difference to be exactly `1`.
- **challenge** drives up, up, down to reach `1`, then undoes three times back
  to `0`, checking `toBeDisabled()` at both ends.
- **review1** clicks past both ends of the range and requires the value to stop
  at `max` and `min` rather than sailing through.

## The teaching point

"State is a snapshot" is the sentence to carry out of this lesson. Every
confusing React behaviour involving stale values traces back to it: the value
you are reading belongs to the render that created the closure you are
standing in. Sometimes that is exactly what you want — event handlers that see
consistent data — and sometimes it is a bug, which is why the updater form
exists and why you will meet the same problem again, much less gently, inside
`useEffect` in lesson 06.

The second thing worth keeping is the question the challenge forced on you:
*what is the minimum I have to store?* Beginners store what they display.
Experienced developers store the smallest thing from which the display can be
computed — a history array, an id rather than a whole object, a filter string
rather than a filtered list. Every piece of redundant state is a chance for two
sources of truth to disagree, and they always eventually do.

Next: **04_lists_conditional**, where you render many things at once and find
out why `key` is the most consequential prop in React.
