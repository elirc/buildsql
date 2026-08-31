// Gate for react/d05_events_updates. Quoted verbatim in README.md.
//
// ex3 asserts on what fireEvent returns: false when a handler called
// preventDefault, true when the default was left alone. ex5 and ex8 use
// fireEvent too - one because it needs exact keyboard modifiers, the other
// because it runs on fake timers, which user-event cannot be mixed with.
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import { DoorBell } from "./ex1/solution";
import { Keypad } from "./ex2/solution";
import { LinkGuard } from "./ex3/solution";
import { NotificationCard } from "./ex4/solution";
import { HotkeyBox } from "./ex5/solution";
import { Basket } from "./ex6/solution";
import { EditorToolbar } from "./ex7/solution";
import { TapTarget } from "./ex8/solution";

afterEach(() => {
  vi.useRealTimers();
});

describe("d05_events_updates", () => {
  test("ex1 - DoorBell rings on the click and not before", async () => {
    const user = userEvent.setup();
    const onRing = vi.fn();
    render(<DoorBell onRing={onRing} />);

    expect(
      onRing,
      "rendering a button is not pressing it. A handler prop that has already " +
        "been called by the time the component appears was called during " +
        "render - onClick wants the function, not the result of calling it " +
        "(README ex1)",
    ).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Ring" }));
    expect(onRing, "one click, one ring").toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Ring" }));
    expect(onRing, "and the second click rings again").toHaveBeenCalledTimes(2);
  }, 30000);

  test("ex2 - Keypad tells the parent which key was pressed", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<Keypad onPress={onPress} />);

    await user.click(screen.getByRole("button", { name: "2" }));
    expect(
      onPress,
      "the parent has to learn which key it was, and the only place that " +
        "information exists is the JSX that built the button. One shared " +
        "handler with no argument cannot tell them apart (README ex2)",
    ).toHaveBeenLastCalledWith(2);

    await user.click(screen.getByRole("button", { name: "3" }));
    expect(onPress, "each digit sends its own number").toHaveBeenLastCalledWith(3);

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(onPress, "and Clear sends the string clear").toHaveBeenLastCalledWith("clear");
    expect(onPress, "three presses, three calls - no extras").toHaveBeenCalledTimes(3);
  }, 30000);

  test("ex3 - LinkGuard handles the click and calls off the navigation", () => {
    const onNavigate = vi.fn();
    render(
      <>
        <LinkGuard href="/settings" onNavigate={onNavigate} />
        <input type="checkbox" aria-label="Control" />
      </>,
    );

    expect(
      fireEvent.click(screen.getByRole("checkbox", { name: "Control" })),
      "a control, so the next assertion means something: fireEvent returns true " +
        "when nothing prevented the default action",
    ).toBe(true);

    const link = screen.getByRole("link", { name: "Settings" });
    expect(
      link,
      "it stays a real link with a real href, so it can still be opened in a " +
        "new tab or read out as a link - the handler is an addition, not a " +
        "replacement (README ex3)",
    ).toHaveAttribute("href", "/settings");

    expect(
      fireEvent.click(link),
      "fireEvent returns false only when a handler called preventDefault. " +
        "Without it the browser leaves your app on the way to a full page load, " +
        "and the router never gets a say",
    ).toBe(false);
    expect(onNavigate, "and the app is told where the user wanted to go").toHaveBeenCalledWith(
      "/settings",
    );
  });

  test("ex4 - NotificationCard keeps the dismiss click to itself", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onDismiss = vi.fn();
    render(<NotificationCard title="Build finished" onOpen={onOpen} onDismiss={onDismiss} />);

    const card = screen.getByRole("group", { name: "Notification" });
    expect(card, "the card shows its title").toHaveTextContent("Build finished");

    await user.click(card);
    expect(onOpen, "clicking the card opens it").toHaveBeenCalledTimes(1);
    expect(onDismiss, "and opens nothing else").not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss, "the button does its own job").toHaveBeenCalledTimes(1);
    expect(
      onOpen,
      "and the click must stop there. Events bubble, so a click on the button " +
        "reaches the card handler too unless the button stops it - the user " +
        "dismissed the notification and got it opened as well (README ex4)",
    ).toHaveBeenCalledTimes(1);
  }, 30000);

  test("ex5 - HotkeyBox reads the keys before it reads the text", () => {
    const onSubmit = vi.fn();
    render(<HotkeyBox onSubmit={onSubmit} />);

    const box = screen.getByLabelText("Message");
    fireEvent.change(box, { target: { value: "ship it" } });

    fireEvent.keyDown(box, { key: "Enter", shiftKey: true });
    expect(
      onSubmit,
      "Shift and Enter is how people write a second line. Submitting on it is " +
        "the single most complained-about bug in chat inputs (README ex5)",
    ).not.toHaveBeenCalled();

    fireEvent.keyDown(box, { key: "Enter" });
    expect(onSubmit, "Enter on its own sends what is in the box").toHaveBeenCalledWith("ship it");
    expect(box, "and the box is emptied, ready for the next message").toHaveValue("");

    fireEvent.change(box, { target: { value: "never mind" } });
    fireEvent.keyDown(box, { key: "Escape" });
    expect(box, "Escape throws the draft away").toHaveValue("");
    expect(onSubmit, "without sending it anywhere").toHaveBeenCalledTimes(1);
  });

  test("ex6 - Basket updates twice and logs what the handler saw", async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();
    render(<Basket onLog={onLog} />);

    expect(screen.getByRole("status"), "the basket starts empty").toHaveTextContent("0 in basket");

    await user.click(screen.getByRole("button", { name: "Add two" }));
    expect(
      screen.getByRole("status"),
      "one click adds two. Reading 1 means both setter calls computed from the " +
        "same captured count, so the second one asked for the value the first " +
        "had already asked for (README ex6)",
    ).toHaveTextContent("2 in basket");
    expect(
      onLog,
      "and the log says 0, because a handler reads the state from the render it " +
        "belongs to - the value does not change under it halfway through",
    ).toHaveBeenCalledWith(0);

    await user.click(screen.getByRole("button", { name: "Add two" }));
    expect(screen.getByRole("status"), "the second click adds two more").toHaveTextContent(
      "4 in basket",
    );
    expect(
      onLog,
      "and logs 2 - the count that was on screen when the click happened",
    ).toHaveBeenLastCalledWith(2);
    expect(onLog, "one log per click").toHaveBeenCalledTimes(2);
  }, 30000);

  test("ex7 - EditorToolbar reads the command off the button that was clicked", async () => {
    const user = userEvent.setup();
    const onCommand = vi.fn();
    render(<EditorToolbar onCommand={onCommand} />);

    const toolbar = screen.getByRole("toolbar", { name: "Formatting" });

    await user.click(screen.getByRole("button", { name: "Bold" }));
    expect(
      onCommand,
      "one listener sits on the toolbar and works out which button the click " +
        "came from. A listener that always sends the same command is not " +
        "delegation, it is a hard-coded guess (README ex7)",
    ).toHaveBeenLastCalledWith("bold");

    await user.click(screen.getByRole("button", { name: "Italic" }));
    expect(onCommand, "the second button sends its own command").toHaveBeenLastCalledWith("italic");

    await user.click(screen.getByRole("button", { name: "Link" }));
    expect(onCommand, "and the third sends its own").toHaveBeenLastCalledWith("link");

    await user.click(toolbar);
    expect(
      onCommand,
      "a click on the toolbar itself hit no button, so there is no command to " +
        "send - the handler has to cope with a target that is not inside one",
    ).toHaveBeenCalledTimes(3);
  }, 30000);

  test("ex8 - TapTarget waits to find out whether the tap was a double", () => {
    vi.useFakeTimers();
    const onSingle = vi.fn();
    const onDouble = vi.fn();
    const { unmount } = render(<TapTarget onSingle={onSingle} onDouble={onDouble} />);

    const target = screen.getByRole("button", { name: "Tap" });

    fireEvent.click(target);
    expect(
      onSingle,
      "a single tap cannot be reported immediately - at this moment it might " +
        "still turn into a double (README ex8)",
    ).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(onSingle, "nothing followed it, so it was a single tap").toHaveBeenCalledTimes(1);
    expect(onDouble, "and certainly not a double").not.toHaveBeenCalled();

    fireEvent.click(target);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    fireEvent.click(target);
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(onDouble, "two taps inside the window are one double tap").toHaveBeenCalledTimes(1);
    expect(
      onSingle,
      "and the single tap that was waiting must have been called off - firing " +
        "both is how a double click ends up deleting the row twice",
    ).toHaveBeenCalledTimes(1);

    fireEvent.click(target);
    unmount();
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(
      onSingle,
      "a timer outliving the component that started it is a leak: it reports a " +
        "tap on something the user has already navigated away from",
    ).toHaveBeenCalledTimes(1);
    expect(onDouble, "and no double either").toHaveBeenCalledTimes(1);
  });
});
