// Gate for react/i1_interview_concepts. Quoted verbatim in README.md.
//
// Four bugs an interviewer is likely to put in front of you, plus one for the
// review ladder. Each is a complete component that compiles and is wrong.
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import { StaleCounter } from "./ex1/solution";
import { ReorderableList } from "./ex2/solution";
import { NicknameForm } from "./ex3/solution";
import { OrderSummary } from "./ex4/solution";
import { ShortcutListener } from "./review1/solution";

afterEach(() => {
  vi.useRealTimers();
});

describe("i1_interview_concepts", () => {
  test("ex1 - StaleCounter keeps counting past one", () => {
    vi.useFakeTimers();
    render(<StaleCounter />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(
      screen.getByRole("status"),
      "three seconds, three ticks, and it reads 1. The function handed to " +
        "setInterval was created during the first render and captured count as " +
        "0 forever, so every tick sets it to 0 + 1. Say that sentence out loud - " +
        "it is the answer they are listening for (README ex1)",
    ).toHaveTextContent("3");

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByRole("status"), "and it keeps going").toHaveTextContent("5");
  });

  test("ex2 - ReorderableList keeps each row attached to its own item", async () => {
    const user = userEvent.setup();
    render(
      <ReorderableList
        initialItems={[
          { id: "z", label: "Zebra" },
          { id: "a", label: "Apple" },
          { id: "m", label: "Mango" },
        ]}
      />,
    );

    await user.type(screen.getByLabelText("Zebra"), "notes");
    await user.click(screen.getByRole("button", { name: "Sort A-Z" }));

    expect(
      screen.queryAllByRole("textbox").length,
      "sorting must not add or drop rows",
    ).toBe(3);
    expect(
      screen.getByLabelText("Zebra"),
      "the text you typed is now in somebody else's box. The list is keyed by " +
        "position, so React thinks the row that used to be first is the same " +
        "row and reuses its DOM node - key by identity (README ex2)",
    ).toHaveValue("notes");
    expect(
      screen.getByLabelText("Apple"),
      "and the row that moved into first place must still be empty",
    ).toHaveValue("");
  }, 20000);

  test("ex3 - NicknameForm can actually be reset", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<NicknameForm onSave={onSave} />);

    await user.type(screen.getByLabelText("Nickname"), "ada");
    expect(screen.getByRole("status"), "the counter follows the field").toHaveTextContent(
      "3 characters",
    );

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onSave, "Save hands over what is in the field").toHaveBeenCalledWith("ada");

    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(
      screen.getByLabelText("Nickname"),
      "Reset emptied the state and the box still shows ada. defaultValue is " +
        "only read once, when the DOM node is created - after that the browser " +
        "owns the value and React cannot put it back (README ex3)",
    ).toHaveValue("");
    expect(screen.getByRole("status"), "and the counter agrees").toHaveTextContent(
      "0 characters",
    );
  }, 20000);

  test("ex4 - OrderSummary computes the total without a second render", () => {
    const onRender = vi.fn();
    const items = [
      { name: "Mug", price: 12 },
      { name: "Poster", price: 18 },
    ];

    const { rerender } = render(<OrderSummary items={items} onRender={onRender} />);

    expect(screen.getByRole("status"), "the total is the sum of the prices").toHaveTextContent(
      "Total: 30",
    );
    expect(
      onRender,
      "rendering this component twice means the user saw Total: 0 first. The " +
        "total is not state - it is something you can work out from the items " +
        "you were given, during the render that needs it (README ex4)",
    ).toHaveBeenCalledTimes(1);

    rerender(<OrderSummary items={[{ name: "Pen", price: 4 }]} onRender={onRender} />);
    expect(screen.getByRole("status"), "new items, new total").toHaveTextContent("Total: 4");
    expect(onRender, "and still one render per change").toHaveBeenCalledTimes(2);
  });

  test("review1 - ShortcutListener subscribes once and stops when it leaves", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const { rerender, unmount } = render(<ShortcutListener onSave={onSave} />);

    await user.keyboard("s");
    expect(onSave, "pressing s saves").toHaveBeenCalledTimes(1);

    rerender(<ShortcutListener onSave={onSave} />);
    await user.keyboard("s");
    expect(
      onSave,
      "one keystroke fired the handler twice, so the re-render added a second " +
        "listener next to the first. An effect with no dependency array runs " +
        "after every render, and one with no cleanup never takes anything back",
    ).toHaveBeenCalledTimes(2);

    unmount();
    await user.keyboard("s");
    expect(
      onSave,
      "and a component that is gone must not still be listening",
    ).toHaveBeenCalledTimes(2);
  }, 20000);
});
