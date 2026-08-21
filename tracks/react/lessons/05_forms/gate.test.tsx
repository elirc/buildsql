// Gate for react/05_forms. Quoted verbatim in README.md.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { NameField } from "./ex1/solution";
import { Preferences } from "./ex2/solution";
import { SignupForm } from "./ex3/solution";
import { LoginForm } from "./ex4/solution";
import { AddressForm } from "./challenge/solution";
import { NewsletterForm } from "./review1/solution";

describe("05_forms", () => {
  test("ex1 - NameField owns what the input shows", async () => {
    const user = userEvent.setup();
    render(<NameField />);

    const input = screen.getByLabelText("Full name");
    await user.type(input, "ada");

    expect(
      input,
      "the box still shows what you typed rather than what the component " +
        "decided. A controlled input renders state, so uppercasing in the " +
        "change handler is enough to change what appears (README ex1)",
    ).toHaveValue("ADA");
    expect(
      screen.getByRole("status"),
      "the live region must report the current length: 3 characters",
    ).toHaveTextContent("3 characters");

    await user.clear(input);
    expect(
      screen.getByRole("status"),
      "clearing the box takes the count back to 0 characters",
    ).toHaveTextContent("0 characters");
  }, 20000);

  test("ex2 - Preferences reads a checkbox and a select", async () => {
    const user = userEvent.setup();
    render(<Preferences />);

    expect(
      screen.getByRole("status"),
      "the defaults are the light theme with emails off",
    ).toHaveTextContent("Theme: light, emails off");

    await user.selectOptions(screen.getByLabelText("Theme"), "dark");
    expect(
      screen.getByRole("status"),
      "a <select> reports its choice through event.target.value, same as a " +
        "text box - the summary should now read Theme: dark, emails off",
    ).toHaveTextContent("Theme: dark, emails off");

    await user.click(screen.getByLabelText("Email me updates"));
    expect(
      screen.getByRole("status"),
      "a checkbox reports through event.target.checked, not .value - .value " +
        'is the string "on" whether it is ticked or not',
    ).toHaveTextContent("Theme: dark, emails on");
  }, 20000);

  test("ex3 - SignupForm keeps two fields in one state object", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText("Name"), "Ada");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");

    expect(
      screen.getByLabelText("Name"),
      "the name field lost its value when the email field was typed into. " +
        "Replacing the whole state object with { email } deletes every other " +
        "key - spread the previous object first (README ex3)",
    ).toHaveValue("Ada");
    expect(screen.getByLabelText("Email"), "and the email field keeps its own").toHaveValue(
      "ada@example.com",
    );
    expect(
      screen.getByRole("status"),
      "the summary reads both fields: Ada <ada@example.com>",
    ).toHaveTextContent("Ada <ada@example.com>");
  }, 20000);

  test("ex4 - LoginForm refuses to submit what it knows is wrong", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Email"), "ada-at-example");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    const alert = screen.queryByRole("alert");
    expect(
      alert,
      'an invalid submit must surface an error region - role="alert" so a ' +
        "screen reader is interrupted and told",
    ).not.toBeNull();
    expect(alert, "say what is wrong with the email").toHaveTextContent(
      "Enter a valid email address",
    );
    expect(alert, "and what is wrong with the password").toHaveTextContent(
      "Password must be at least 8 characters",
    );
    expect(
      onSubmit,
      "onSubmit must NOT be called while the form is invalid - and the page " +
        "must not have navigated, which means preventDefault()",
    ).not.toHaveBeenCalled();

    await user.clear(screen.getByLabelText("Email"));
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.clear(screen.getByLabelText("Password"));
    await user.type(screen.getByLabelText("Password"), "correct-horse");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      screen.queryByRole("alert"),
      "once the input is valid the error region has to go away",
    ).toBeNull();
    expect(
      onSubmit,
      "a valid submit calls onSubmit once with the current values",
    ).toHaveBeenCalledWith({ email: "ada@example.com", password: "correct-horse" });
  }, 30000);

  test("challenge - AddressForm points each error at the field that caused it", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AddressForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Street"), "12 Bell Lane");
    await user.type(screen.getByLabelText("Postcode"), "12x");
    await user.click(screen.getByRole("button", { name: "Save address" }));

    const postcode = screen.getByLabelText("Postcode");
    expect(
      postcode,
      'a field that failed validation must say so on itself: aria-invalid="true"',
    ).toHaveAttribute("aria-invalid", "true");
    expect(
      postcode,
      "and the reason has to be its accessible description, wired with " +
        "aria-describedby - an error message floating near a field is not " +
        "connected to it for anyone who cannot see the layout (README challenge)",
    ).toHaveAccessibleDescription("Postcode must be four digits");
    expect(
      screen.getByLabelText("Street"),
      "the street was fine, so it must not be marked invalid",
    ).toHaveAttribute("aria-invalid", "false");
    expect(onSubmit, "a form with any invalid field does not submit").not.toHaveBeenCalled();

    await user.clear(postcode);
    await user.type(postcode, "3021");
    await user.click(screen.getByRole("button", { name: "Save address" }));

    expect(
      screen.getByLabelText("Postcode"),
      "fixing the value has to clear the invalid flag too",
    ).toHaveAttribute("aria-invalid", "false");
    expect(onSubmit, "and then the address goes through").toHaveBeenCalledWith({
      street: "12 Bell Lane",
      postcode: "3021",
    });
  }, 30000);

  test("review1 - NewsletterForm unlocks only when both fields are ready", async () => {
    const user = userEvent.setup();
    const onSubscribe = vi.fn();
    render(<NewsletterForm onSubscribe={onSubscribe} />);

    const button = screen.getByRole("button", { name: "Subscribe" });
    expect(button, "nothing has been filled in yet, so Subscribe is disabled").toBeDisabled();

    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    expect(
      button,
      "an email alone is not enough - the consent box is still unticked",
    ).toBeDisabled();

    await user.click(screen.getByLabelText("I agree to the terms"));
    expect(
      button,
      "with an email and consent the button unlocks. Derive disabled from the " +
        "two pieces of state during render rather than storing a third",
    ).toBeEnabled();

    await user.click(button);
    expect(onSubscribe, "and clicking it hands back the email").toHaveBeenCalledWith(
      "ada@example.com",
    );
  }, 20000);
});
