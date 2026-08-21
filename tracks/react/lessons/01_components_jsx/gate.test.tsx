// Gate for react/01_components_jsx. Quoted verbatim in README.md.
import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { PageHeader } from "./ex1/solution";
import { ProfileLink } from "./ex2/solution";
import { LabelledField } from "./ex3/solution";
import { Notice } from "./ex4/solution";
import { Crumb } from "./challenge/solution";
import { Field } from "./review1/solution";

describe("01_components_jsx", () => {
  test("ex1 - PageHeader wraps a level-1 heading and a paragraph in one header", () => {
    render(<PageHeader title="Lesson 01" subtitle="JSX has rules" />);

    const banner = screen.queryByRole("banner");
    expect(
      banner,
      "nothing on the page has the banner role - the two children have to be " +
        "wrapped in a <header> element, which is what gives you that role",
    ).not.toBeNull();
    expect(
      within(banner!).getByRole("heading", { level: 1 }),
      "the <h1> inside the header must show the title prop - reread README ex1",
    ).toHaveTextContent("Lesson 01");
    expect(
      within(banner!).getByRole("paragraph"),
      "the <p> inside the header must show the subtitle prop, unchanged",
    ).toHaveTextContent("JSX has rules");
  });

  test("ex2 - ProfileLink puts the name in the text and the href in the attribute", () => {
    render(<ProfileLink name="Ada" href="/people/ada" />);

    const link = screen.queryByRole("link");
    expect(
      link,
      "no link on the page - role link comes from an <a> that actually has an " +
        "href attribute; an <a> without one is not a link to anybody",
    ).not.toBeNull();
    expect(
      link,
      "the link's visible text is its accessible name, and it must read: Open Ada",
    ).toHaveAccessibleName("Open Ada");
    expect(
      link,
      "href is an attribute, so its value goes in braces: href={href}. " +
        'Writing href="href" would send the browser to a file called href.',
    ).toHaveAttribute("href", "/people/ada");
  });

  test("ex3 - LabelledField returns two siblings with no wrapper element", () => {
    const { container } = render(
      <dl>
        <LabelledField label="Email" value="ada@example.com" />
        <LabelledField label="Role" value="Student" />
      </dl>,
    );

    expect(
      screen.queryAllByRole("term").map((el) => el.textContent),
      "each LabelledField owes the page one <dt> holding the label",
    ).toEqual(["Email", "Role"]);
    expect(
      screen.queryAllByRole("definition").map((el) => el.textContent),
      "each LabelledField owes the page one <dd> holding the value",
    ).toEqual(["ada@example.com", "Student"]);

    const dl = container.querySelector("dl");
    expect(
      Array.from(dl?.children ?? []).map((el) => el.tagName),
      "the <dl> must contain four direct children, dt/dd/dt/dd. Any wrapper " +
        "element between <dl> and <dt> is invalid HTML and shows up here - " +
        "a component returns one value, so return a fragment (README ex3)",
    ).toEqual(["DT", "DD", "DT", "DD"]);
  });

  test("ex4 - Notice picks its live-region role from the tone prop", () => {
    const { rerender } = render(<Notice tone="error" message="Save failed" />);

    const alert = screen.queryByRole("alert");
    expect(
      alert,
      'tone="error" is urgent, so the wrapper needs role="alert" - a screen ' +
        "reader interrupts to read those out",
    ).not.toBeNull();
    expect(alert, "the alert must show the message prop").toHaveTextContent("Save failed");

    rerender(<Notice tone="info" message="Draft saved" />);
    expect(
      screen.queryByRole("alert"),
      'tone="info" must NOT be an alert - the role is computed from the prop, ' +
        "not hard-coded",
    ).toBeNull();
    expect(
      screen.queryByRole("status"),
      'tone="info" is polite, so the wrapper needs role="status"',
    ).toHaveTextContent("Draft saved");
  });

  test("challenge - Crumb renders a link, or the current page as plain text", () => {
    const { rerender } = render(<Crumb label="Lessons" href="/lessons" current={false} />);

    expect(
      screen.queryByRole("link", { name: "Lessons" }),
      "a crumb that is not the current page is a link to it",
    ).toHaveAttribute("href", "/lessons");

    rerender(<Crumb label="01 Components" href="/lessons/01" current />);
    expect(
      screen.queryByRole("link"),
      "the crumb for the page you are already on must not be a link - linking " +
        "to where you already are is a dead end for keyboard and screen-reader " +
        "users (README challenge)",
    ).toBeNull();
    const here = screen.getByText("01 Components");
    expect(
      here,
      'the current crumb still has to be findable and marked: aria-current="page"',
    ).toHaveAttribute("aria-current", "page");
  });

  test("review1 - Field wires a label and a hint to one input", () => {
    render(<Field id="email" label="Email address" hint="We never share it." />);

    const input = screen.queryByLabelText("Email address");
    expect(
      input,
      "no form control is labelled Email address - a <label htmlFor={id}> only " +
        "attaches to a control whose id matches it exactly",
    ).not.toBeNull();
    expect(
      input,
      "the hint has to be wired to the input with aria-describedby, pointing at " +
        "the id of the element that holds the hint text",
    ).toHaveAccessibleDescription("We never share it.");
  });
});
