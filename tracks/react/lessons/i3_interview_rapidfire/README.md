# i3 — Rapid fire

Five short rounds. Every one of them is a ⭐⭐⭐ concept from the question bank,
in a shape you have not seen it in — because the thing that fails in an
interview is never the concept you studied, it is the concept you studied
*wearing different clothes*.

None of these needs more than a few minutes. That is the point: this is the
lesson you run when you have twenty minutes and an interview on Thursday. Aim
to diagnose each one **before** you run the gate — read the component, predict
the failure, then check whether you were right. Being able to spot the bug by
reading is a different skill from being able to fix it once a test has told you
where it is, and it is the one that transfers.

Every exercise here, including the four core ones, is marked for **spaced
review**. `dojo review` will bring them back at 3, 7, 21 and 60 days, which is
the mechanism that stops this material fading between now and whenever you
actually need it. Run `uv run dojo review run` when it tells you something is
due.

## Round 1 — keys, with state inside the row

Edit `ex1/solution.tsx`.

`ScoreBoard` renders one `PlayerRow` per player, and each row keeps **its own
score in its own `useState`**. Score Ada twice, add a player to the front, and
Ada's two points must still be Ada's.

Lesson 04 made this happen to an uncontrolled input. Notice what is different
here, and what that tells you about what keys really control.

```
uv run dojo test react i3_interview_rapidfire ex1
```

## Round 2 — dependencies and cleanup, on a subscription

Edit `ex2/solution.tsx`.

`ChannelIndicator({ channel, label, onSubscribe, onUnsubscribe })` must:

- subscribe once on mount;
- do **nothing** when only `label` changes;
- on a channel change, unsubscribe from the **old** channel and then subscribe
  to the new one;
- unsubscribe on unmount.

Four requirements, one effect, and three of them are currently wrong.

```
uv run dojo test react i3_interview_rapidfire ex2
```

## Round 3 — the update queue

Edit `ex3/solution.tsx`.

`TripleBump` has one button, `Add three`, whose handler calls the setter three
times — and moves the counter by one. Make it three, keeping all three calls,
and note the second assertion: it must still be a **single** render.

```
uv run dojo test react i3_interview_rapidfire ex3
```

## Round 4 — memo, defeated by one prop

Edit `ex4/solution.tsx`.

`Body` is wrapped in `memo` and you may not change it. `Panel` re-renders it on
every toggle anyway. Find the prop that makes the comparison impossible and fix
it in `Panel`.

```
uv run dojo test react i3_interview_rapidfire ex4
```

## Review — conditional rendering, and the zero

`review1/solution.tsx`. `NotificationBell({ unread, messages })`:

- with no messages: the text `You are all caught up`, and **no list**;
- with unread messages: a badge reading `3 new`;
- with nothing unread: no badge, and **no stray `0` anywhere on the page**.

```
uv run dojo test react i3_interview_rapidfire review1
```

## The gate

This is the entire gate, `gate.test.tsx`:

<!-- GATE:BEGIN -->

```tsx
// Gate for react/i3_interview_rapidfire. Quoted verbatim in README.md.
//
// Five short problems, each a three-star concept in a shape you have not seen
// it in before. All five are marked for the review ladder, so they come back.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { ScoreBoard } from "./ex1/solution";
import { ChannelIndicator } from "./ex2/solution";
import { TripleBump } from "./ex3/solution";
import { Panel } from "./ex4/solution";
import { NotificationBell } from "./review1/solution";

describe("i3_interview_rapidfire", () => {
  test("ex1 - ScoreBoard keeps a row score attached to its own player", async () => {
    const user = userEvent.setup();
    render(
      <ScoreBoard
        initialPlayers={[
          { id: "ada", name: "Ada" },
          { id: "lin", name: "Lin" },
        ]}
        newcomer={{ id: "zoe", name: "Zoe" }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Point for Ada" }));
    await user.click(screen.getByRole("button", { name: "Point for Ada" }));
    expect(screen.queryByText("Ada: 2"), "two points for Ada").not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Add player to front" }));

    expect(
      screen.queryByText("Ada: 2"),
      "Ada's score followed the position instead of the player. Each row holds " +
        "its own useState, and the key is what tells React which row is which - " +
        "key by identity, not by index (README ex1)",
    ).not.toBeNull();
    expect(
      screen.queryByText("Zoe: 0"),
      "and the new player starts on nothing, because she is a new row",
    ).not.toBeNull();
  }, 20000);

  test("ex2 - ChannelIndicator resubscribes only when the channel changes", () => {
    const onSubscribe = vi.fn();
    const onUnsubscribe = vi.fn();
    const { rerender, unmount } = render(
      <ChannelIndicator
        channel="news"
        label="A"
        onSubscribe={onSubscribe}
        onUnsubscribe={onUnsubscribe}
      />,
    );

    expect(onSubscribe, "subscribe on mount").toHaveBeenCalledTimes(1);
    expect(onSubscribe, "to the channel you were given").toHaveBeenLastCalledWith("news");

    rerender(
      <ChannelIndicator
        channel="news"
        label="B"
        onSubscribe={onSubscribe}
        onUnsubscribe={onUnsubscribe}
      />,
    );
    expect(
      onSubscribe,
      "only the label changed. An effect with no dependency array runs after " +
        "every render, so this tore down a perfectly good subscription and " +
        "opened another - list what the effect actually reads",
    ).toHaveBeenCalledTimes(1);
    expect(onUnsubscribe, "and nothing was unsubscribed").not.toHaveBeenCalled();

    rerender(
      <ChannelIndicator
        channel="sport"
        label="B"
        onSubscribe={onSubscribe}
        onUnsubscribe={onUnsubscribe}
      />,
    );
    expect(
      onUnsubscribe,
      "a real channel change must close the old subscription first, and the " +
        "cleanup belongs to the render that opened it - so it unsubscribes news",
    ).toHaveBeenLastCalledWith("news");
    expect(onSubscribe, "then open the new one").toHaveBeenLastCalledWith("sport");

    unmount();
    expect(
      onUnsubscribe,
      "and leaving the page has to close it too, or it leaks",
    ).toHaveBeenLastCalledWith("sport");
  });

  test("ex3 - TripleBump adds three in one render", async () => {
    const user = userEvent.setup();
    const onRender = vi.fn();
    render(<TripleBump onRender={onRender} />);

    const before = onRender.mock.calls.length;
    await user.click(screen.getByRole("button", { name: "Add three" }));

    expect(
      screen.getByRole("status"),
      "three calls to the setter, and it moved by one. Each of them read the " +
        "same count from the same render - pass a function so each sees what " +
        "the one before it produced (README ex3)",
    ).toHaveTextContent("3");
    expect(
      onRender.mock.calls.length - before,
      "and all three updates land in a single render, because React batches " +
        "everything one event produces",
    ).toBe(1);
  }, 20000);

  test("ex4 - Panel stops rebuilding the prop that defeats its own memo", async () => {
    const user = userEvent.setup();
    const onBodyRender = vi.fn();
    render(<Panel onBodyRender={onBodyRender} />);

    expect(onBodyRender, "one render on mount").toHaveBeenCalledTimes(1);

    const toggle = screen.getByRole("button", { name: "Toggle" });
    await user.click(toggle);
    await user.click(toggle);
    await user.click(toggle);

    expect(screen.getByRole("status"), "the toggle still works").toHaveTextContent("open");
    expect(
      onBodyRender,
      "Body is wrapped in memo and re-rendered anyway, because one of its props " +
        "is an object literal built fresh on every render. memo compares by " +
        "identity, so that comparison can never succeed (README ex4)",
    ).toHaveBeenCalledTimes(1);
  }, 20000);

  test("review1 - NotificationBell shows an empty state and never a stray zero", () => {
    const quiet = render(<NotificationBell unread={0} messages={[]} />);

    expect(
      quiet.container.textContent,
      "with nothing unread a 0 reached the page. {unread && <Badge/>} is the " +
        "number 0 when unread is 0, and React renders 0 - it only skips false, " +
        "null and undefined",
    ).not.toMatch(/0/);
    expect(
      screen.queryByText("You are all caught up"),
      "an empty inbox has to say so",
    ).not.toBeNull();
    expect(screen.queryByRole("list"), "and must not render an empty list").toBeNull();
    quiet.unmount();

    render(
      <NotificationBell
        unread={3}
        messages={[
          { id: "1", subject: "Invoice" },
          { id: "2", subject: "Welcome" },
        ]}
      />,
    );
    expect(screen.queryByText("3 new"), "with unread messages the badge shows").not.toBeNull();
    expect(
      screen.queryAllByRole("listitem").map((li) => li.textContent),
      "and the subjects are listed",
    ).toEqual(["Invoice", "Welcome"]);
  });
});
```

<!-- GATE:END -->

In plain English:

- **ex1** scores Ada twice, prepends a player, and looks for the text `Ada: 2`
  and `Zoe: 0`. With index keys the component instance holding the `2` is now
  rendering Zoe.
- **ex2** checks the subscribe call on mount, re-renders with only the label
  changed and requires *no* new calls, changes the channel and checks which
  channel was unsubscribed, then unmounts.
- **ex3** clicks once, requires `3`, and requires the render count to have gone
  up by exactly one.
- **ex4** clicks the toggle three times and requires the memoized child to have
  rendered once in total.
- **review1** renders the quiet case and asserts the whole rendered text
  contains no `0` at all, then renders the busy case.

## The teaching point

Spaced repetition is doing the real work here, not this page. Four exercises you
solve once and never see again are worth very little; four that come back on day
3, day 7, day 21 and day 60 are how the material stops being something you
looked up and starts being something you know.

So the habit to build is small: when `dojo status` says a review is due, do it
that day. It takes five minutes, it is the cheapest thing in this course, and it
is the difference between having done a React course and being able to answer
React questions cold.

That is the end of the React track. `uv run dojo status react` shows where you
stand; `uv run dojo review` shows what is due next; and `uv run dojo tracks`
shows what else is waiting.
