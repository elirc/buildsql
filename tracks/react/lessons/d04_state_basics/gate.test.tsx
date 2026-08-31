// Gate for react/d04_state_basics. Quoted verbatim in README.md.
//
// The timer drill (ex7) uses fireEvent and fake timers rather than user-event:
// user-event waits on real timers, and mixing the two makes a test that passes
// on a fast machine and fails on a slow one.
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import { WaterTracker } from "./ex1/solution";
import { Spoiler } from "./ex2/solution";
import { DraftBox } from "./ex3/solution";
import { QueueBoard } from "./ex4/solution";
import { SearchSummary } from "./ex5/solution";
import { NotificationSettings } from "./ex6/solution";
import { DelayedCounter } from "./ex7/solution";
import { TitleDraft } from "./ex8/solution";

afterEach(() => {
  vi.useRealTimers();
});

describe("d04_state_basics", () => {
  test("ex1 - WaterTracker counts glasses and stops at the goal", async () => {
    const user = userEvent.setup();
    render(<WaterTracker goal={3} />);

    expect(
      screen.getByRole("status"),
      "before anything is clicked the live region reads: 0 of 3 glasses",
    ).toHaveTextContent("0 of 3 glasses");

    await user.click(screen.getByRole("button", { name: "Drink" }));
    expect(
      screen.getByRole("status"),
      "one click, one glass. A value the component recomputes from a plain " +
        "variable never reaches the screen - only a state update schedules a " +
        "re-render (README ex1)",
    ).toHaveTextContent("1 of 3 glasses");

    await user.click(screen.getByRole("button", { name: "Drink" }));
    await user.click(screen.getByRole("button", { name: "Drink" }));
    expect(screen.getByRole("status"), "three clicks, three glasses").toHaveTextContent(
      "3 of 3 glasses",
    );
    expect(
      screen.getByRole("button", { name: "Drink" }),
      "at the goal the button is disabled, so the count cannot run past it",
    ).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("status"), "Reset goes back to zero").toHaveTextContent(
      "0 of 3 glasses",
    );
    expect(
      screen.getByRole("button", { name: "Drink" }),
      "and the Drink button works again - disabled is computed from the count, " +
        "not remembered separately",
    ).toBeEnabled();
  }, 30000);

  test("ex2 - Spoiler shows the text only while it is open", async () => {
    const user = userEvent.setup();
    render(<Spoiler text="The butler did it" />);

    expect(
      screen.queryByText("The butler did it"),
      "a spoiler that is in the document from the start is not a spoiler - " +
        "hidden here means not rendered (README ex2)",
    ).toBeNull();

    const button = screen.getByRole("button", { name: "Show spoiler" });
    await user.click(button);
    expect(screen.queryByText("The butler did it"), "one click reveals it").not.toBeNull();
    expect(
      screen.queryByRole("button", { name: "Hide spoiler" }),
      "and the same button renames itself, because its name is computed from " +
        "the state rather than typed in twice",
    ).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Hide spoiler" }));
    expect(screen.queryByText("The butler did it"), "and clicking again hides it").toBeNull();
    expect(screen.queryByRole("button", { name: "Show spoiler" })).not.toBeNull();
  }, 30000);

  test("ex3 - DraftBox builds its first value once and only once", async () => {
    const user = userEvent.setup();
    const makeInitial = vi.fn(() => "Hi");
    const { rerender } = render(<DraftBox makeInitial={makeInitial} />);

    expect(screen.getByRole("status"), "the draft starts as whatever the maker returned").toHaveTextContent(
      "Hi",
    );
    expect(
      makeInitial,
      "the initial value is built once, on mount. Calling it yourself and " +
        "handing the result to useState runs it on every single render - pass " +
        "the function, do not call it (README ex3)",
    ).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Append" }));
    await user.click(screen.getByRole("button", { name: "Append" }));
    expect(screen.getByRole("status"), "each click appends one character").toHaveTextContent("Hi!!");
    expect(
      makeInitial,
      "two state updates later it still must not have run again - the initial " +
        "value is only ever needed once",
    ).toHaveBeenCalledTimes(1);

    rerender(<DraftBox makeInitial={makeInitial} />);
    expect(makeInitial, "and a re-render from the parent is not a remount").toHaveBeenCalledTimes(1);
  }, 30000);

  test("ex4 - QueueBoard replaces the array instead of editing it", async () => {
    const user = userEvent.setup();
    render(<QueueBoard names={["Ada", "Bo", "Cy"]} />);

    expect(
      screen.getByRole("status"),
      "an empty queue reads: 0 waiting - Next: nobody",
    ).toHaveTextContent("0 waiting - Next: nobody");
    expect(
      screen.getByRole("button", { name: "Remove first" }),
      "there is nothing to remove yet",
    ).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(
      screen.getByRole("status"),
      "push() edits the array React is already holding, so React sees the same " +
        "array and has no reason to re-render. Build a new array and hand that " +
        "to the setter (README ex4)",
    ).toHaveTextContent("1 waiting - Next: Ada");

    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(
      screen.getByRole("status"),
      "the second name joins the back of the queue - the front is unchanged",
    ).toHaveTextContent("2 waiting - Next: Ada");

    await user.click(screen.getByRole("button", { name: "Remove first" }));
    expect(
      screen.getByRole("status"),
      "removing the head promotes the next name",
    ).toHaveTextContent("1 waiting - Next: Bo");

    await user.click(screen.getByRole("button", { name: "Add" }));
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByRole("status")).toHaveTextContent("3 waiting - Next: Bo");
    expect(
      screen.getByRole("button", { name: "Add" }),
      "the names prop has three entries and all three are in the queue, so " +
        "there is nothing left to add",
    ).toBeDisabled();
  }, 30000);

  test("ex5 - SearchSummary derives the summary during the render that changed", () => {
    const onRender = vi.fn();
    const items = ["Ada", "Amir", "Bo", "Cyrus"];
    const { rerender } = render(<SearchSummary items={items} query="" onRender={onRender} />);

    expect(
      screen.getByRole("status"),
      "an empty query is not a search, so the summary reads: Showing all 4 items",
    ).toHaveTextContent("Showing all 4 items");
    expect(
      onRender,
      "mounting this component renders it once. Twice means it set state after " +
        "mounting, which is a copy of the props kept in state (README ex5)",
    ).toHaveBeenCalledTimes(1);

    onRender.mockClear();
    rerender(<SearchSummary items={items} query="a" onRender={onRender} />);

    expect(
      screen.getByRole("status"),
      "Ada and Amir match a, Bo and Cyrus do not, so: 2 of 4 items match a",
    ).toHaveTextContent("2 of 4 items match a");
    expect(
      onRender,
      "one prop change must cost exactly one render. A component that copies " +
        "props into state with an effect renders the stale answer first and the " +
        "right one second - the user sees the flicker and you see two renders",
    ).toHaveBeenCalledTimes(1);

    onRender.mockClear();
    rerender(<SearchSummary items={items} query="cy" onRender={onRender} />);
    expect(screen.getByRole("status")).toHaveTextContent("1 of 4 items match cy");
    expect(onRender, "and again for the next query").toHaveBeenCalledTimes(1);
  });

  test("ex6 - NotificationSettings toggles one setting and leaves the rest alone", async () => {
    const user = userEvent.setup();
    render(<NotificationSettings />);

    const email = () => screen.getByRole("switch", { name: "Email" });
    const sms = () => screen.getByRole("switch", { name: "SMS" });
    const quiet = () => screen.getByRole("switch", { name: "Quiet hours" });

    expect(email(), "email starts on").toHaveAttribute("aria-checked", "true");
    expect(sms(), "sms starts off").toHaveAttribute("aria-checked", "false");
    expect(quiet(), "quiet hours starts off").toHaveAttribute("aria-checked", "false");

    await user.click(email());
    expect(email(), "the switch you clicked flips").toHaveAttribute("aria-checked", "false");
    expect(
      sms(),
      "and its neighbour inside the same nested object does not - copy the " +
        "level you are changing, keep the rest (README ex6)",
    ).toHaveAttribute("aria-checked", "false");

    await user.click(sms());
    await user.click(quiet());
    expect(sms()).toHaveAttribute("aria-checked", "true");
    expect(quiet()).toHaveAttribute("aria-checked", "true");
    expect(email(), "three toggles, three independent answers").toHaveAttribute(
      "aria-checked",
      "false",
    );

    await user.click(screen.getByRole("button", { name: "Revert" }));
    expect(
      email(),
      "Revert restores the settings this component started with. If it does " +
        "not, the toggles edited that starting object in place - mutating " +
        "state reaches further than the state",
    ).toHaveAttribute("aria-checked", "true");
    expect(sms(), "sms is back off").toHaveAttribute("aria-checked", "false");
    expect(quiet(), "and so is quiet hours").toHaveAttribute("aria-checked", "false");
  }, 30000);

  test("ex7 - DelayedCounter survives three taps and a reset", () => {
    vi.useFakeTimers();
    render(<DelayedCounter />);

    const later = screen.getByRole("button", { name: "Later" });
    fireEvent.click(later);
    fireEvent.click(later);
    fireEvent.click(later);

    expect(
      screen.getByRole("status"),
      "nothing has happened yet - each tap only schedules the increment",
    ).toHaveTextContent("Count: 0");

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(
      screen.getByRole("status"),
      "three taps landed together and the count is 3. Reading 1 means all three " +
        "callbacks captured the same count from the render that created them - " +
        "the updater form reads the value at the moment it runs (README ex7)",
    ).toHaveTextContent("Count: 3");

    fireEvent.click(later);
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("status"), "Reset is immediate").toHaveTextContent("Count: 0");

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(
      screen.getByRole("status"),
      "the tap that was still in flight when Reset was pressed must never " +
        "arrive - Reset cancels what it undid, or the count creeps back up on " +
        "its own a second later",
    ).toHaveTextContent("Count: 0");
  });

  test("ex8 - TitleDraft starts over when the note changes", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<TitleDraft noteId="n1" initialTitle="Roasting notes" />);

    const box = () => screen.getByLabelText("Title");
    expect(box(), "the box opens with the title it was given").toHaveValue("Roasting notes");

    await user.clear(box());
    await user.type(box(), "Grinder notes");
    expect(box(), "and the user can type over it").toHaveValue("Grinder notes");

    rerender(<TitleDraft noteId="n1" initialTitle="Roasting notes" />);
    expect(
      box(),
      "same note, so the draft survives. A parent re-render must not throw away " +
        "what someone was in the middle of typing (README ex8)",
    ).toHaveValue("Grinder notes");

    rerender(<TitleDraft noteId="n2" initialTitle="Milk notes" />);
    expect(
      box(),
      "a different note is a different draft. useState only reads its argument " +
        "on the first render, so the new title never arrives unless the " +
        "component notices the id changed and says so",
    ).toHaveValue("Milk notes");

    await user.type(box(), " v2");
    rerender(<TitleDraft noteId="n2" initialTitle="Milk notes" />);
    expect(box(), "and the new draft is editable in its turn").toHaveValue("Milk notes v2");
  }, 30000);
});
