// Gate for react/02_props_composition. Quoted verbatim in README.md.
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { Card } from "./ex1/solution";
import { Rating } from "./ex2/solution";
import { Panel } from "./ex3/solution";
import { TextField } from "./ex4/solution";
import { Modal } from "./challenge/solution";
import { MediaObject } from "./review1/solution";

describe("02_props_composition", () => {
  test("ex1 - Card renders its title and whatever children it was given", () => {
    const { container } = render(
      <Card title="Settings">
        <p>Two-factor authentication is on.</p>
      </Card>,
    );

    expect(
      screen.queryByRole("heading", { level: 3 }),
      "Card owes the page a level-3 heading holding the title prop",
    ).toHaveTextContent("Settings");
    expect(
      screen.queryByText("Two-factor authentication is on."),
      "the paragraph the gate passed between <Card> and </Card> never reached " +
        "the DOM - children is a prop, and a component that never renders it " +
        "throws its children away (README ex1)",
    ).not.toBeNull();
    expect(
      container.textContent,
      "the title has to come before the children, not after",
    ).toMatch(/Settings[\s\S]*Two-factor/);
  });

  test("ex2 - Rating defaults max to 5 and names itself for screen readers", () => {
    const first = render(<Rating value={3} />);

    const stars = screen.queryByRole("img");
    expect(
      stars,
      'a run of stars is a picture made of text, so it needs role="img" and a ' +
        "name - otherwise a screen reader reads out three black star characters",
    ).not.toBeNull();
    expect(
      stars,
      "with no max prop the rating is out of 5, so the accessible name must be " +
        "exactly: 3 out of 5 stars. Getting undefined here means the default " +
        "parameter is missing",
    ).toHaveAccessibleName("3 out of 5 stars");
    expect(
      stars,
      "a sighted user should see one star per point of value",
    ).toHaveTextContent("★★★");
    first.unmount();

    render(<Rating value={2} max={3} />);
    expect(
      screen.queryByRole("img"),
      "an explicit max prop must win over the default - expect: 2 out of 3 stars",
    ).toHaveAccessibleName("2 out of 3 stars");
  });

  test("ex3 - Panel places three separately-passed regions in order", () => {
    const { container } = render(
      <Panel header={<h2>Billing</h2>} footer={<button type="button">Save</button>}>
        <p>Your plan renews monthly.</p>
      </Panel>,
    );

    expect(
      screen.queryByRole("heading", { level: 2 }),
      "the header prop holds JSX and has to be rendered, not stringified",
    ).toHaveTextContent("Billing");
    expect(
      screen.queryByRole("button", { name: "Save" }),
      "the footer prop holds JSX too - a whole <button> in this case",
    ).not.toBeNull();
    expect(
      container.textContent,
      "the three regions must appear in the order header, children, footer - " +
        "that ordering is the only thing Panel decides (README ex3)",
    ).toMatch(/Billing[\s\S]*renews monthly[\s\S]*Save/);
  });

  test("ex4 - TextField forwards every prop it was not told about", () => {
    render(
      <TextField
        label="Email"
        id="email"
        type="email"
        placeholder="you@example.com"
        maxLength={40}
      />,
    );

    const input = screen.queryByLabelText("Email");
    expect(
      input,
      "no control is labelled Email - the label and the input are joined by " +
        "htmlFor and id, and both come from props",
    ).not.toBeNull();
    expect(
      input,
      "type was not one of TextField's own props, so it belongs to the input - " +
        "collect the leftovers with ...rest and spread them",
    ).toHaveAttribute("type", "email");
    expect(input, "placeholder must reach the input too").toHaveAttribute(
      "placeholder",
      "you@example.com",
    );
    expect(input, "so must maxLength, spelled maxlength once it is in the DOM").toHaveAttribute(
      "maxlength",
      "40",
    );
  });

  test("challenge - Modal is a named, modal dialog with a working close button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal title="Delete file?" onClose={onClose}>
        <p>This cannot be undone.</p>
      </Modal>,
    );

    const dialog = screen.queryByRole("dialog");
    expect(
      dialog,
      'nothing has the dialog role - the outer element needs role="dialog"',
    ).not.toBeNull();
    expect(
      dialog,
      "the dialog must be announced by its title. Point aria-labelledby at the " +
        "id of the heading that holds it - a dialog with no name is announced " +
        'as just "dialog" (README challenge)',
    ).toHaveAccessibleName("Delete file?");
    expect(
      dialog,
      'aria-modal="true" tells assistive technology the rest of the page is inert',
    ).toHaveAttribute("aria-modal", "true");
    expect(
      within(dialog!).queryByText("This cannot be undone."),
      "the children belong inside the dialog element, not beside it",
    ).not.toBeNull();

    await user.click(within(dialog!).getByRole("button", { name: "Close" }));
    expect(
      onClose,
      "clicking Close must call the onClose prop exactly once",
    ).toHaveBeenCalledTimes(1);
  });

  test("review1 - MediaObject renders a media slot beside its children", () => {
    const { container } = render(
      <MediaObject media={<img src="/ada.png" alt="Portrait of Ada" />}>
        <p>Ada Lovelace wrote the first algorithm.</p>
      </MediaObject>,
    );

    expect(
      screen.queryByRole("img", { name: "Portrait of Ada" }),
      "the media prop is JSX handed in by the caller - render it as-is",
    ).not.toBeNull();
    expect(
      screen.queryByText("Ada Lovelace wrote the first algorithm."),
      "the children have to be rendered as well",
    ).not.toBeNull();
    expect(
      container.querySelector("img")?.compareDocumentPosition(
        screen.getByText("Ada Lovelace wrote the first algorithm."),
      ),
      "the media must come before the body text in document order (Node.DOCUMENT_POSITION_FOLLOWING is 4)",
    ).toBe(4);
  });
});
