# d14 — Refs and the DOM (drill set)

Eight problems on the first of `useRef`'s two jobs: getting hold of a real DOM
node and doing something to it that React has no way to describe. It drills
`08_refs_dom` — the box-that-survives-renders half of that lesson is the next
drill set, `d15_ref_patterns`.

Almost everything asserted here is **focus**, because focus is the imperative
operation users actually notice: it is the difference between a form a keyboard
user can finish and one that strands them. The rest is reading and clearing
values the browser owns. Nothing is timed, so there are no timers anywhere.

## Exercise 1 — the cursor follows the subject

Edit `ex1/solution.tsx`. `ReplyBox({ replyingTo })` renders
`Replying to <replyingTo>` in a paragraph and a `<textarea>` labelled `Reply`.
The textarea takes focus when the component appears **and** whenever
`replyingTo` changes — and at no other time: a rerender that changes nothing
must leave the cursor exactly where the user put it.

```
uv run dojo test react d14_refs_dom ex1
```

## Exercise 2 — the value React never saw

Edit `ex2/solution.tsx`. `PromoCode({ onApply })` renders an **uncontrolled**
input labelled `Promo code`, an `Apply` button that calls `onApply` with
whatever the field currently holds, and a `Clear` button that empties the field
and puts the cursor back in it. The stub mixes `defaultValue` with state and
ends up reading neither.

```
uv run dojo test react d14_refs_dom ex2
```

## Exercise 3 — pass the ref on

Edit `ex3/solution.tsx`. `IconField({ label, ref })` renders a decorative
`<span aria-hidden="true">#</span>`, a `<label>` showing `label`, and an
`<input>` joined to it. The `ref` prop is optional; when it is given it must
end up pointing at the `<input>`, so a parent holding it can focus and type
into that field.

```
uv run dojo test react d14_refs_dom ex3
```

## Exercise 4 — the first thing that is missing

Edit `ex4/solution.tsx`. `CheckoutFields({ onSubmit })` renders three inputs
labelled `Name`, `Email` and `Card`, and a `Pay` button. Pressing `Pay` with
any of them empty shows `Fill in <label>` in a `role="alert"` paragraph and
moves focus to that field — always the **first** empty one, top to bottom — and
calls nothing. With all three filled it calls
`onSubmit({ name, email, card })` and clears the alert.

```
uv run dojo test react d14_refs_dom ex4
```

## Exercise 5 — arrow keys move the focus

Edit `ex5/solution.tsx`. `CommandMenu({ commands, onRun })` renders a
`role="menu"` element containing one `role="menuitem"` button per command. The
first entry is focused when the menu appears. `ArrowDown` and `ArrowUp` move
the focus one entry, wrapping at both ends; `Home` and `End` jump to the first
and last. Exactly one entry is in the tab order at a time (`tabIndex` 0, the
rest -1). Clicking an entry calls `onRun` with its command.

```
uv run dojo test react d14_refs_dom ex5
```

## Exercise 6 — ask the form, not the fields

Edit `ex6/solution.tsx`. `IssueDraft({ onSend })` renders a `<form>` with an
input named `summary` labelled `Summary`, a textarea named `details` labelled
`Details`, a `Send` button and a `Discard` button. `Send` calls
`onSend({ summary, details })` with the values the form holds and then empties
the form; `Discard` empties the form and sends nothing.

```
uv run dojo test react d14_refs_dom ex6
```

## Exercise 7 — the keyboard stays inside

Edit `ex7/solution.tsx`. `ExportDialog()` renders an `Export` button. Clicking
it opens a `role="dialog"` with `aria-modal="true"`, named by its `Export data`
heading, containing a checkbox labelled `Include drafts`, a `Download` button
and a `Cancel` button. Opening it focuses the checkbox. `Tab` from `Cancel`
wraps to the checkbox and `Shift+Tab` from the checkbox wraps to `Cancel`.
`Cancel` closes the dialog and returns focus to the `Export` button.

```
uv run dojo test react d14_refs_dom ex7
```

## Exercise 8 — where the focus goes when the row is gone

Edit `ex8/solution.tsx`. `PlaylistRows({ songs })` renders a level-2 heading
`Playlist` (focusable by script, not by tabbing), then one `<li>` per song
containing the song's name and a button named `Remove <song>`. Removing a row
drops it from the list and moves focus to the **next** row's remove button, or
to the **previous** one when there is no next, or to the heading when the list
is now empty — in which case a `role="status"` paragraph reads `No tracks
left`. The component owns the list after mount; the prop is only its starting
value.

```
uv run dojo test react d14_refs_dom ex8
```

## The gate

This is the entire gate, `gate.test.tsx`:

<!-- GATE:BEGIN -->

```tsx
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
```

<!-- GATE:END -->

Next: **d15_ref_patterns**, where the ref holds no node at all.
