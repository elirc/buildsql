// Gate for react/08_refs_dom. Quoted verbatim in README.md.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef } from "react";
import { describe, expect, test, vi } from "vitest";

import { AutoFocusInput } from "./ex1/solution";
import { ClickTracker } from "./ex2/solution";
import { FancyInput } from "./ex3/solution";
import { Editor, type EditorHandle } from "./challenge/solution";
import { FocusOnOpen } from "./review1/solution";

describe("08_refs_dom", () => {
  test("ex1 - AutoFocusInput takes focus as soon as it appears", () => {
    render(<AutoFocusInput label="Email" />);

    expect(
      screen.getByLabelText("Email"),
      "the field is on screen but nothing is focused, so a keyboard user has " +
        "to tab to it. Point a ref at the input and call .focus() from an " +
        "effect, once the DOM exists (README ex1)",
    ).toHaveFocus();
  });

  test("ex2 - ClickTracker remembers without re-rendering", async () => {
    const user = userEvent.setup();
    const onRender = vi.fn();
    render(<ClickTracker onRender={onRender} />);

    const before = onRender.mock.calls.length;
    const tap = screen.getByRole("button", { name: "Tap" });
    await user.click(tap);
    await user.click(tap);
    await user.click(tap);

    expect(
      onRender.mock.calls.length - before,
      "counting the taps must not re-render anything - nothing on screen has " +
        "changed yet. Writing to a ref does not schedule a render, which is " +
        "the entire reason to use one here (README ex2)",
    ).toBe(0);
    expect(
      screen.queryByRole("status"),
      "and the total stays hidden until it is asked for",
    ).toBeNull();

    await user.click(screen.getByRole("button", { name: "Show total" }));
    expect(
      screen.queryByRole("status"),
      "revealing the total does need a render, so that part is state - expect: 3 taps",
    ).toHaveTextContent("3 taps");
    expect(
      onRender.mock.calls.length - before,
      "exactly one render, caused by the reveal",
    ).toBe(1);
  }, 20000);

  test("ex3 - FancyInput lets its parent reach the real input", async () => {
    const user = userEvent.setup();

    function Harness() {
      const field = useRef<HTMLInputElement>(null);
      return (
        <>
          <FancyInput ref={field} label="Search" />
          <button type="button" onClick={() => field.current?.focus()}>
            Focus the field
          </button>
        </>
      );
    }

    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Focus the field" }));

    expect(
      screen.getByLabelText("Search"),
      "the parent's ref never reached the <input>, so field.current was null " +
        "and the click did nothing. A component that wraps a form control " +
        "should pass a ref through to it",
    ).toHaveFocus();
  }, 20000);

  test("challenge - Editor exposes exactly two operations and no more", async () => {
    const user = userEvent.setup();

    function Harness() {
      const editor = useRef<EditorHandle>(null);
      return (
        <>
          <Editor label="Notes" />
          <Editor ref={editor} label="Draft" />
          <button type="button" onClick={() => editor.current?.clear()}>
            Clear the draft
          </button>
          <button type="button" onClick={() => editor.current?.focus()}>
            Focus the draft
          </button>
        </>
      );
    }

    render(<Harness />);
    const draft = screen.getByLabelText("Draft");
    await user.type(draft, "hello");
    expect(draft, "typing works normally").toHaveValue("hello");

    await user.click(screen.getByRole("button", { name: "Clear the draft" }));
    expect(
      screen.getByLabelText("Draft"),
      "clear() has to empty this editor. The handle the parent holds is not " +
        "the DOM node - it is the object you chose to expose (README challenge)",
    ).toHaveValue("");
    expect(
      screen.getByLabelText("Notes"),
      "and it must only affect the editor the ref points at",
    ).toHaveValue("");

    await user.click(screen.getByRole("button", { name: "Focus the draft" }));
    expect(screen.getByLabelText("Draft"), "focus() has to focus it").toHaveFocus();
  }, 30000);

  test("review1 - FocusOnOpen moves focus in and hands it back", async () => {
    const user = userEvent.setup();
    render(<FocusOnOpen />);

    const open = screen.getByRole("button", { name: "Open" });
    await user.click(open);

    const close = screen.getByRole("button", { name: "Close" });
    expect(
      close,
      "when a dialog opens, focus has to move into it - otherwise a keyboard " +
        "user is still standing outside a dialog they cannot see",
    ).toHaveFocus();

    await user.click(close);
    expect(
      screen.queryByRole("dialog"),
      "closing removes the dialog",
    ).toBeNull();
    expect(
      screen.getByRole("button", { name: "Open" }),
      "and focus goes back where it came from. Without this, focus falls to " +
        "the top of the document and the user loses their place entirely",
    ).toHaveFocus();
  }, 20000);
});
