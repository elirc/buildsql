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
