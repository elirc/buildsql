// Gate for react/d14_refs_dom. Quoted verbatim in README.md.
//
// Everything asserted here is something a user could observe: which element
// has focus, what a field contains, what is announced. Keyboard drills use
// fireEvent so the exact key sequence is under this file's control.
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, test, vi } from "vitest";

import { ReplyBox } from "./ex1/solution";
import { PromoCode } from "./ex2/solution";
import { IconField } from "./ex3/solution";
import { CheckoutFields } from "./ex4/solution";
import { CommandMenu } from "./ex5/solution";
import { IssueDraft } from "./ex6/solution";
import { ExportDialog } from "./ex7/solution";
import { PlaylistRows } from "./ex8/solution";

describe("d14_refs_dom", () => {
  test("ex1 - ReplyBox puts the cursor where the next word goes", () => {
    const { rerender } = render(
      <>
        <ReplyBox replyingTo="Ada" />
        <button type="button">Elsewhere</button>
      </>,
    );

    expect(
      screen.getByLabelText("Reply"),
      "the box exists to be typed in, so it takes focus when it appears - a " +
        "ref gives you the node and an effect is where it is safe to touch it " +
        "(README ex1)",
    ).toHaveFocus();

    act(() => screen.getByRole("button", { name: "Elsewhere" }).focus());
    rerender(
      <>
        <ReplyBox replyingTo="Ada" />
        <button type="button">Elsewhere</button>
      </>,
    );
    expect(
      screen.getByRole("button", { name: "Elsewhere" }),
      "nothing changed, so nothing should move. An effect with no dependency " +
        "array snatches the cursor back on every render, which is what a " +
        "keyboard user experiences as the page fighting them",
    ).toHaveFocus();

    rerender(
      <>
        <ReplyBox replyingTo="Bo" />
        <button type="button">Elsewhere</button>
      </>,
    );
    expect(screen.getByText("Replying to Bo"), "the new recipient is shown").toBeInTheDocument();
    expect(
      screen.getByLabelText("Reply"),
      "and a new recipient is a new reply, so the cursor goes back to the box",
    ).toHaveFocus();
  });

  test("ex2 - PromoCode reads the box that the browser is keeping", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    render(<PromoCode onApply={onApply} />);

    const box = screen.getByLabelText("Promo code");
    await user.type(box, "SPRING20");
    await user.click(screen.getByRole("button", { name: "Apply" }));

    expect(
      onApply,
      "the field is uncontrolled, so React does not know what is in it - the " +
        "DOM node does, and a ref is how you ask it (README ex2)",
    ).toHaveBeenLastCalledWith("SPRING20");

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(
      box,
      "clearing an uncontrolled field means writing to the node, because there " +
        "is no state for React to re-render from",
    ).toHaveValue("");
    expect(box, "and the cursor goes back where the typing happens").toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Apply" }));
    expect(onApply, "an empty box applies an empty code").toHaveBeenLastCalledWith("");
  }, 30000);

  test("ex3 - IconField hands the parent the node it asked for", async () => {
    const user = userEvent.setup();
    const room = createRef<HTMLInputElement>();

    render(
      <>
        <IconField label="Room" ref={room} />
        <IconField label="Topic" />
      </>,
    );

    expect(screen.getByLabelText("Topic"), "a field with no ref still works").toBeInTheDocument();

    act(() => room.current?.focus());
    expect(
      screen.getByLabelText("Room"),
      "in React 19 a ref is an ordinary prop, and a wrapper that keeps it to " +
        "itself leaves the parent holding null. Pass it on to the node the " +
        "parent means (README ex3)",
    ).toHaveFocus();

    await user.type(screen.getByLabelText("Room"), "Kitchen");
    expect(screen.getByLabelText("Room"), "and it is the real input").toHaveValue("Kitchen");
    expect(screen.getByLabelText("Topic"), "the other field is untouched").toHaveValue("");
  }, 30000);

  test("ex4 - CheckoutFields sends the user to the first thing that is missing", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CheckoutFields onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Pay" }));
    expect(onSubmit, "nothing is filled in, so nothing is submitted").not.toHaveBeenCalled();
    expect(screen.getByRole("alert"), "and the alert names one field").toHaveTextContent(
      "Fill in Name",
    );
    expect(
      screen.getByLabelText("Name"),
      "the first empty field is where the user has to go, and telling them " +
        "without taking them there is half a fix. A loop with no early exit " +
        "focuses the last empty field instead (README ex4)",
    ).toHaveFocus();

    await user.type(screen.getByLabelText("Name"), "Rosa");
    await user.click(screen.getByRole("button", { name: "Pay" }));
    expect(screen.getByRole("alert"), "now the first gap is further down").toHaveTextContent(
      "Fill in Email",
    );
    expect(screen.getByLabelText("Email"), "and so is the cursor").toHaveFocus();

    await user.type(screen.getByLabelText("Email"), "rosa@example.com");
    await user.type(screen.getByLabelText("Card"), "4111");
    await user.click(screen.getByRole("button", { name: "Pay" }));

    expect(onSubmit, "a complete form goes through").toHaveBeenCalledTimes(1);
    expect(onSubmit, "with what the three nodes hold").toHaveBeenLastCalledWith({
      name: "Rosa",
      email: "rosa@example.com",
      card: "4111",
    });
    expect(screen.queryByRole("alert"), "and the complaint is gone").toBeNull();
  }, 30000);

  test("ex5 - CommandMenu moves the focus, not just a highlight", () => {
    const onRun = vi.fn();
    render(<CommandMenu commands={["Rename", "Duplicate", "Archive"]} onRun={onRun} />);

    const item = (name: string) => screen.getByRole("menuitem", { name });
    expect(
      screen.getByRole("menu"),
      "the menu is a menu, and its entries are menuitems",
    ).toBeInTheDocument();
    expect(item("Rename"), "an open menu starts on its first entry").toHaveFocus();

    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(
      item("Duplicate"),
      "ArrowDown has to move the browser's focus, not only a class name. A " +
        "highlighted item that is not focused is invisible to a screen reader " +
        "and unreachable by Enter (README ex5)",
    ).toHaveFocus();

    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(item("Rename"), "and past the end it wraps round to the start").toHaveFocus();

    fireEvent.keyDown(document.activeElement!, { key: "ArrowUp" });
    expect(item("Archive"), "as does going up from the start").toHaveFocus();

    fireEvent.keyDown(document.activeElement!, { key: "Home" });
    expect(item("Rename"), "Home is the first entry").toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: "End" });
    expect(item("Archive"), "End is the last").toHaveFocus();

    fireEvent.click(document.activeElement!);
    expect(onRun, "and running the focused entry runs that one").toHaveBeenLastCalledWith("Archive");
  });

  test("ex6 - IssueDraft asks the form what it holds", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<IssueDraft onSend={onSend} />);

    await user.type(screen.getByLabelText("Summary"), "Grinder jams");
    await user.type(screen.getByLabelText("Details"), "Only on the coarse setting");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(
      onSend,
      "a ref to the form itself is worth more than a ref per field: FormData " +
        "reads every named control at once (README ex6)",
    ).toHaveBeenLastCalledWith({
      summary: "Grinder jams",
      details: "Only on the coarse setting",
    });
    expect(
      screen.getByLabelText("Summary"),
      "and a sent draft is an empty draft - form.reset() empties every control " +
        "in one call",
    ).toHaveValue("");
    expect(screen.getByLabelText("Details")).toHaveValue("");

    await user.type(screen.getByLabelText("Summary"), "Second thoughts");
    await user.click(screen.getByRole("button", { name: "Discard" }));

    expect(
      onSend,
      "Discard is not Send. A button inside a form with no type is a submit " +
        "button, which is the oldest trap in HTML",
    ).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("Summary"), "and the draft is gone").toHaveValue("");
  }, 30000);

  test("ex7 - ExportDialog keeps the keyboard inside it and gives it back", async () => {
    const user = userEvent.setup();
    render(<ExportDialog />);

    const opener = screen.getByRole("button", { name: "Export" });
    await user.click(opener);

    const dialog = screen.getByRole("dialog");
    expect(dialog, "a modal says so").toHaveAttribute("aria-modal", "true");
    expect(
      screen.getByLabelText("Include drafts"),
      "opening a dialog moves focus into it, or the keyboard is still out on " +
        "the page behind (README ex7)",
    ).toHaveFocus();

    fireEvent.keyDown(document.activeElement!, { key: "Tab", shiftKey: true });
    expect(
      screen.getByRole("button", { name: "Cancel" }),
      "Shift+Tab from the first control wraps to the last one instead of " +
        "escaping the dialog",
    ).toHaveFocus();

    fireEvent.keyDown(document.activeElement!, { key: "Tab" });
    expect(
      screen.getByLabelText("Include drafts"),
      "and Tab from the last wraps back to the first - a modal the keyboard " +
        "can walk out of is not modal",
    ).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog"), "Cancel closes it").toBeNull();
    expect(
      opener,
      "and focus goes back to the button that opened it, because otherwise it " +
        "lands on the document body and the user starts again from the top",
    ).toHaveFocus();
  }, 30000);

  test("ex8 - PlaylistRows never drops the focus on the floor", async () => {
    const user = userEvent.setup();
    render(<PlaylistRows songs={["Aurora", "Bergen", "Corvus"]} />);

    await user.click(screen.getByRole("button", { name: "Remove Bergen" }));
    expect(
      screen.queryAllByRole("listitem").length,
      "the row goes",
    ).toBe(2);
    expect(
      screen.getByRole("button", { name: "Remove Corvus" }),
      "the focused button was just removed from the document, and focus falls " +
        "to the body unless something catches it. The row that took its place " +
        "is the one the user meant to be near (README ex8)",
    ).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Remove Corvus" }));
    expect(
      screen.getByRole("button", { name: "Remove Aurora" }),
      "removing the last row has no next row, so focus moves back one instead",
    ).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Remove Aurora" }));
    expect(screen.queryByRole("status"), "an empty playlist says so").toHaveTextContent(
      "No tracks left",
    );
    expect(
      screen.getByRole("heading", { name: "Playlist" }),
      "with no rows at all, focus belongs on the heading of the thing that " +
        "just emptied - which needs tabIndex -1 to be focusable at all",
    ).toHaveFocus();
  }, 30000);
});
