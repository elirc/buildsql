// Gate for react/00_hello_dojo. Quoted verbatim in README.md.
// One test per exercise; the title starts with the exercise directory name so
// `dojo test react 00_hello_dojo ex2` can select just that one.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { Greeting } from "./ex1/solution";
import { TrackSummary } from "./ex2/solution";
import { IconButton } from "./ex3/solution";

describe("00_hello_dojo", () => {
  test("ex1 - Greeting renders a level-1 heading built from its name prop", () => {
    const { unmount } = render(<Greeting name="Eli" />);
    expect(
      screen.getByRole("heading", { level: 1 }),
      "the level-1 heading must read exactly: Hello, Eli! Welcome to the dojo. " +
        "- compare it character by character, punctuation included (README ex1)",
    ).toHaveTextContent("Hello, Eli! Welcome to the dojo.");
    unmount();

    render(<Greeting name="Ada" />);
    expect(
      screen.getByRole("heading", { level: 1 }),
      "the name has to come from the prop, not be hard-coded - reread README ex1",
    ).toHaveTextContent("Hello, Ada! Welcome to the dojo.");
  });

  test("ex2 - TrackSummary agrees with its own number", () => {
    const many = render(<TrackSummary track="react" lessons={15} />);
    expect(
      many.container.textContent?.trim(),
      "TrackSummary should render one paragraph reading: react: 15 lessons",
    ).toBe("react: 15 lessons");
    many.unmount();

    const one = render(<TrackSummary track="node" lessons={1} />);
    expect(
      one.container.textContent?.trim(),
      "one lesson is a lesson, not lessons - the plural is a decision your " +
        "component has to make, not a template you can write once",
    ).toBe("node: 1 lesson");
    one.unmount();

    const none = render(<TrackSummary track="csharp" lessons={0} />);
    expect(
      none.container.textContent?.trim(),
      "zero is plural in English - expect: csharp: 0 lessons",
    ).toBe("csharp: 0 lessons");
  });

  test("ex3 - IconButton has an accessible name and reports its clicks", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<IconButton label="Close panel" glyph="x" onPress={onPress} />);

    const button = screen.getByRole("button");
    expect(
      button,
      "a screen reader announces the accessible name, and yours is the glyph. " +
        "Give the button an aria-label so it is announced as: Close panel",
    ).toHaveAccessibleName("Close panel");
    expect(
      button,
      "the glyph is still what a sighted user sees, so it belongs in the " +
        "button's visible content - reread README ex3",
    ).toHaveTextContent("x");

    await user.click(button);
    await user.click(button);
    expect(
      onPress,
      "each click on the button must call the onPress prop exactly once - " +
        "wire it to the button's onClick",
    ).toHaveBeenCalledTimes(2);
  });
});
