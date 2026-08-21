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
