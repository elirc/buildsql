// Gate for react/d03_children_composition. Quoted verbatim in README.md.
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { Section } from "./ex1/solution";
import { FieldWrapper } from "./ex2/solution";
import { Banner } from "./ex3/solution";
import { PageLayout } from "./ex4/solution";
import { Button, DangerButton } from "./ex5/solution";
import { Toggler } from "./ex6/solution";
import { Case, Switcher } from "./ex7/solution";
import { FormField } from "./ex8/solution";

describe("d03_children_composition", () => {
  test("ex1 - Section puts a heading above whatever it was handed", () => {
    const { container } = render(
      <Section title="Shipping">
        <p>We ship on Tuesdays.</p>
      </Section>,
    );

    expect(
      screen.queryByRole("heading", { level: 2, name: "Shipping" }),
      "the title prop becomes a level-2 heading. A styled div is not a heading " +
        "and cannot be jumped to (README ex1)",
    ).not.toBeNull();
    expect(
      screen.queryByText("We ship on Tuesdays."),
      "and the children are rendered as they arrived - the component does not " +
        "get to know or care what they are",
    ).not.toBeNull();

    const section = container.querySelector("section");
    expect(
      Array.from(section?.children ?? []).map((element) => element.tagName),
      "the wrapper is a <section> holding exactly the heading and then the " +
        "children, in that order",
    ).toEqual(["H2", "P"]);
  });

  test("ex2 - FieldWrapper labels whatever control it wraps", () => {
    const { rerender } = render(
      <FieldWrapper label="Email">
        <input type="email" />
      </FieldWrapper>,
    );

    const email = screen.queryByLabelText("Email");
    expect(
      email,
      "the input is found by its label text, which means the label and the " +
        "control have to be genuinely associated. A span with the words in it " +
        "looks identical and associates nothing (README ex2)",
    ).not.toBeNull();
    expect(email, "and the child arrived untouched, type and all").toHaveAttribute("type", "email");

    rerender(
      <FieldWrapper label="Ship it faster">
        <input type="checkbox" />
      </FieldWrapper>,
    );
    expect(
      screen.queryByRole("checkbox", { name: "Ship it faster" }),
      "the same wrapper has to work for a checkbox without being told - it " +
        "wraps children, it does not inspect them",
    ).not.toBeNull();
  });

  test("ex3 - Banner picks its live region from the tone and keeps the children inside", () => {
    const { rerender } = render(
      <Banner tone="urgent">
        Card declined. <a href="/billing">Update billing</a>
      </Banner>,
    );

    const alert = screen.queryByRole("alert");
    expect(
      alert,
      "an urgent banner is role=alert, which a screen reader interrupts to read " +
        "(README ex3)",
    ).not.toBeNull();
    expect(
      within(alert!).queryByRole("link", { name: "Update billing" }),
      "children can be markup, not just text, and they belong inside the live " +
        "region so they are announced with it",
    ).not.toBeNull();
    expect(screen.queryByRole("status"), "an urgent banner is not also a polite one").toBeNull();

    rerender(<Banner tone="info">Saved as a draft</Banner>);
    expect(
      screen.queryByRole("status"),
      "any other tone is polite: role=status, announced when the user is next " +
        "idle. Hard-coding the role is what this check catches",
    ).toHaveTextContent("Saved as a draft");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  test("ex4 - PageLayout drops three slots into three landmarks", () => {
    render(
      <PageLayout header={<h1>Dojo</h1>} sidebar={<a href="/settings">Settings</a>}>
        <p>Welcome back.</p>
      </PageLayout>,
    );

    const banner = screen.queryByRole("banner");
    expect(
      banner,
      "the header slot goes in a <header>, which is the banner landmark - see " +
        "README ex4",
    ).not.toBeNull();
    expect(within(banner!).queryByRole("heading", { name: "Dojo" })).not.toBeNull();

    const aside = screen.queryByRole("complementary");
    expect(
      aside,
      "the sidebar slot goes in an <aside>, which is the complementary landmark",
    ).not.toBeNull();
    expect(within(aside!).queryByRole("link", { name: "Settings" })).not.toBeNull();

    const main = screen.queryByRole("main");
    expect(main, "and children go in <main>, the one landmark a page may have once").not.toBeNull();
    expect(
      within(main!).queryByText("Welcome back."),
      "children are the default slot: the content of the page, not a prop",
    ).not.toBeNull();
    expect(
      within(main!).queryByRole("link", { name: "Settings" }),
      "the slots must not bleed into one another - the sidebar is beside the " +
        "main region, not inside it",
    ).toBeNull();
  });

  test("ex5 - DangerButton is a Button with the dangerous parts filled in", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onDelete = vi.fn();
    const { rerender } = render(<Button onClick={onSave}>Save draft</Button>);

    const save = screen.queryByRole("button", { name: "Save draft" });
    expect(
      save,
      "a default Button is named by its children and carries no warning " +
        "(README ex5)",
    ).not.toBeNull();
    expect(save, "and it is type=button").toHaveAttribute("type", "button");
    await user.click(save!);
    expect(onSave, "clicking calls onClick once").toHaveBeenCalledTimes(1);

    rerender(
      <Button tone="danger" onClick={onSave}>
        Delete tag
      </Button>,
    );
    expect(
      screen.queryByRole("button", { name: "Delete tag (cannot be undone)" }),
      "the danger tone adds the warning to the button text, so it lands in the " +
        "accessible name",
    ).not.toBeNull();

    rerender(<DangerButton onClick={onDelete}>Delete account</DangerButton>);
    const danger = screen.queryByRole("button", { name: "Delete account (cannot be undone)" });
    expect(
      danger,
      "DangerButton is the same button with one decision already made. If it " +
        "went its own way and reimplemented the markup, the two names drift " +
        "apart the first time either is edited",
    ).not.toBeNull();
    await user.click(danger!);
    expect(onDelete, "and it passes onClick straight through").toHaveBeenCalledTimes(1);
  }, 30000);

  test("ex6 - Toggler hands its state to a function and renders what comes back", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Toggler>
        {({ on, toggle }) => (
          <>
            <button type="button" onClick={toggle}>
              Toggle details
            </button>
            <output>{on ? "Open" : "Closed"}</output>
          </>
        )}
      </Toggler>,
    );

    expect(
      screen.getByRole("status").textContent,
      "the children function is called with the current state, which starts " +
        "off (README ex6)",
    ).toBe("Closed");

    await user.click(screen.getByRole("button", { name: "Toggle details" }));
    expect(
      screen.getByRole("status").textContent,
      "the toggle handed to the children has to actually flip the state and " +
        "re-render - a function that closes over nothing changes nothing",
    ).toBe("Open");

    await user.click(screen.getByRole("button", { name: "Toggle details" }));
    expect(screen.getByRole("status").textContent, "and back again").toBe("Closed");

    expect(
      Array.from(container.children).map((element) => element.tagName),
      "Toggler owns the state and renders none of the markup, so what reaches " +
        "the page is exactly what the function returned - no wrapper div",
    ).toEqual(["BUTTON", "OUTPUT"]);
  }, 30000);

  test("ex7 - Switcher renders the one Case that matches and ignores the rest", () => {
    const tree = (value: string) => (
      <Switcher value={value} fallback={<p>Unknown state</p>}>
        {false}
        <Case when="idle">
          <p>Nothing running</p>
        </Case>
        {null}{" "}
        <Case when="loading">
          <p>Working on it</p>
        </Case>
        <Case when="error">
          <p>It broke</p>
        </Case>
      </Switcher>
    );

    const { rerender } = render(tree("loading"));

    expect(
      screen.queryByText("Working on it"),
      "the Case whose when equals the value is the one that renders - see " +
        "README ex7",
    ).not.toBeNull();
    expect(
      screen.queryByText("Nothing running"),
      "and the others render nothing at all. Rendering every child and hiding " +
        "the wrong ones with CSS is not the same thing, and shows up here",
    ).toBeNull();
    expect(screen.queryByText("It broke")).toBeNull();
    expect(screen.queryByText("Unknown state"), "a match means no fallback").toBeNull();

    rerender(tree("error"));
    expect(screen.queryByText("It broke"), "a new value picks a new Case").not.toBeNull();
    expect(screen.queryByText("Working on it")).toBeNull();

    rerender(tree("paused"));
    expect(
      screen.queryByText("Unknown state"),
      "no Case matches paused, so the fallback is what the user gets. Note " +
        "that the false, the null and the whitespace among the children must " +
        "not be mistaken for Cases on the way past",
    ).not.toBeNull();
  });

  test("ex8 - FormField wires a label, a control and a hint together with one id", () => {
    const { rerender } = render(
      <FormField>
        <FormField.Label>Password</FormField.Label>
        <FormField.Control type="password" />
        <FormField.Hint>At least 12 characters</FormField.Hint>
      </FormField>,
    );

    const control = screen.queryByLabelText("Password");
    expect(
      control,
      "the label and the control never meet in the JSX - they find each other " +
        "through the id the FormField shares with both (README ex8)",
    ).not.toBeNull();
    expect(control, "props passed to FormField.Control reach the real input").toHaveAttribute(
      "type",
      "password",
    );
    expect(
      control,
      "and the hint becomes the control accessible description, which is what " +
        "aria-describedby is for",
    ).toHaveAccessibleDescription("At least 12 characters");

    rerender(
      <>
        <FormField>
          <FormField.Label>City</FormField.Label>
          <FormField.Control />
        </FormField>
        <FormField>
          <FormField.Label>Country</FormField.Label>
          <FormField.Control />
        </FormField>
      </>,
    );

    const city = screen.queryByLabelText("City");
    const country = screen.queryByLabelText("Country");
    expect(city, "two FormFields on one page both work").not.toBeNull();
    expect(country).not.toBeNull();
    expect(
      city,
      "and they must be two different inputs. A hard-coded id makes both labels " +
        "point at the first input, so clicking the second label focuses the " +
        "wrong box - useId exists for exactly this",
    ).not.toBe(country);
    expect(
      city,
      "with no FormField.Hint in the children there is no description to give",
    ).not.toHaveAccessibleDescription();
    expect(
      city,
      "and no aria-describedby either - an attribute pointing at an element " +
        "that was never rendered is a bug that no browser will report to you",
    ).not.toHaveAttribute("aria-describedby");
  });
});
