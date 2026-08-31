# d09 — Form validation (drill set)

Eight problems on saying no politely: when to check, which field to blame, how to
connect a message to the box it is about, and what a form does while the server
is still thinking. It drills `05_forms` — the second half, the part with
`aria-invalid` and `aria-describedby` in it.

Two rules run through the whole set. **An error message that is not wired to its
field is decoration**: `aria-describedby` is what makes it the field's accessible
description, and the gate reads exactly that. And **a disabled button is not
validation** — a control the user cannot press cannot tell them why.

The last two problems are async. The slow function arrives as a prop and the gate
resolves it by hand, so nothing here waits on a clock.

## Exercise 1 — required, and connected

Edit `ex1/solution.tsx`. `RequiredEmail({ onSubmit })` renders an input labelled
`Email` and a `Continue` submit button. Submitting an empty field must not call
`onSubmit`, must set `aria-invalid="true"` on the input, and must give it the
accessible description `Email is required`. A filled field submits once, with the
address **trimmed**, and leaves no error behind.

```
uv run dojo test react d09_forms_validation ex1
```

## Exercise 2 — complain late, forgive early

Edit `ex2/solution.tsx`. `UsernameField()` renders an input labelled `Username`.
The rule is three characters. While the user is typing for the first time there
is no error at all. When they leave the field, a value that breaks the rule gets
`aria-invalid="true"` and the description
`Username must be at least 3 characters`. From then on the field is judged on
every keystroke, so fixing it clears the error immediately.

```
uv run dojo test react d09_forms_validation ex2
```

## Exercise 3 — which field is wrong

Edit `ex3/solution.tsx`. `PasswordPair({ onSubmit })` renders `Password` and
`Confirm password` inputs and a `Set password` button.

- an empty password is a `Password is required` error **on the password field**;
- a confirmation that does not match is a `Passwords do not match` error **on the
  confirmation field**, and the password field stays valid;
- when they match, `onSubmit` is called once with the password.

```
uv run dojo test react d09_forms_validation ex3
```

## Exercise 4 — the error summary

Edit `ex4/solution.tsx`. `BookingForm({ onSubmit })` renders `Name`, `Email` and
`Guests` inputs and a `Book` button. The rules: name is required
(`Name is required`), email must contain an `@`
(`Enter a valid email address`), guests must be a number from 1 to 8
(`Guests must be between 1 and 8`).

An invalid submit renders a `role="alert"` region listing every current problem
and **moves focus to the first invalid field**, in the order name, email, guests.
A valid submit calls `onSubmit({ name, email, guests })` with `guests` as a
number, and leaves no alert on screen.

```
uv run dojo test react d09_forms_validation ex4
```

## Exercise 5 — normalise before you judge

Edit `ex5/solution.tsx`. `CouponField({ onApply })` renders an input labelled
`Coupon code` and an `Apply` button. A code is trimmed and upper-cased first,
then tested against three letters, a dash and four digits. A code that fails gets
`aria-invalid="true"` and the description `Coupon codes look like ABC-1234`. A
code that passes calls `onApply` with the **normalised** value.

```
uv run dojo test react d09_forms_validation ex5
```

## Exercise 6 — a rule between two fields

Edit `ex6/solution.tsx`. `DateRange({ onSubmit })` renders `Start date` and
`End date` inputs (`type="date"`) and a `Check availability` button that is
disabled until both are filled. Pressing it with an end date **before** the start
date attaches `End date cannot be before the start date` to the end field and
calls nothing; the start field stays valid. Equal dates are a legal one-day
range. A valid range calls `onSubmit({ start, end })` with the two ISO strings.

The gate drives the date fields with `fireEvent.change` and the button with
`fireEvent.click`, so the button here is an ordinary `type="button"`.

```
uv run dojo test react d09_forms_validation ex6
```

## Exercise 7 — the rule the server owns

Edit `ex7/solution.tsx`. `HandleField({ checkAvailable })` renders an input
labelled `Handle`, a `role="status"` region and a `Save` button.
`checkAvailable(handle)` returns a promise of a boolean.

- `Save` is disabled until a check has come back saying the handle is free;
- leaving the field runs the check with the trimmed handle;
- while it is in flight the status region reads `Checking`;
- taken (`false`) becomes the field's error, `That handle is taken`;
- free (`true`) makes the status read `Available` and unlocks `Save`;
- editing the field clears the error, the status and the permission to save,
  because they were all about a value that no longer exists.

```
uv run dojo test react d09_forms_validation ex7
```

## Exercise 8 — the whole loop

Edit `ex8/solution.tsx`. `ProfileSetup({ onSubmit })` renders `Team name` (at
least 3 characters, `Team name must be at least 3 characters`) and `Website`
(must start with `https://`, `Website must start with https://`), a
`role="status"` region and a `Create profile` submit button.

- no field shows an error before the first submit attempt;
- after one attempt, every field is judged on every keystroke, each error wired
  to its field with `aria-describedby`;
- `onSubmit` returns a promise: while it is pending the button reads `Saving` and
  is disabled, so a second press does nothing at all;
- when it resolves, the status region reads `Saved` and the button says
  `Create profile` again.

```
uv run dojo test react d09_forms_validation ex8
```

## The gate

This is the entire gate, `gate.test.tsx`:

<!-- GATE:BEGIN -->

```tsx
// Gate for react/d09_forms_validation. Quoted verbatim in README.md.
//
// The two async drills inject the slow function as a prop and drive it with a
// deferred, so the gate decides when the answer arrives - no waiting, no timers.
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { RequiredEmail } from "./ex1/solution";
import { UsernameField } from "./ex2/solution";
import { PasswordPair } from "./ex3/solution";
import { BookingForm } from "./ex4/solution";
import { CouponField } from "./ex5/solution";
import { DateRange } from "./ex6/solution";
import { HandleField } from "./ex7/solution";
import { ProfileSetup } from "./ex8/solution";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

async function settle(promise: Promise<unknown>, action: () => void) {
  await act(async () => {
    action();
    await promise.catch(() => undefined);
  });
}

describe("d09_forms_validation", () => {
  test("ex1 - RequiredEmail blocks an empty submit and says so on the field", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<RequiredEmail onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Continue" }));

    const field = screen.getByLabelText("Email");
    expect(
      onSubmit,
      "an invalid form must not submit - validate before you call anything " +
        "(README ex1)",
    ).not.toHaveBeenCalled();
    expect(
      field,
      "the field that failed says so on itself, with aria-invalid=true",
    ).toHaveAttribute("aria-invalid", "true");
    expect(
      field,
      "and the reason is the field-s accessible description, which means an " +
        "error element wired up with aria-describedby. A message merely sitting " +
        "next to the box is connected to nothing",
    ).toHaveAccessibleDescription("Email is required");

    await user.type(field, "  ada@example.com  ");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(field, "a valid field is not an invalid one").toHaveAttribute("aria-invalid", "false");
    expect(
      field,
      "and the description goes away with the error - drop aria-describedby " +
        "when there is nothing to describe",
    ).not.toHaveAccessibleDescription();
    expect(onSubmit, "one valid submit, one call").toHaveBeenCalledTimes(1);
    expect(
      onSubmit,
      "the address is trimmed on the way out - the spaces were a typing " +
        "accident, not part of the address",
    ).toHaveBeenCalledWith("ada@example.com");
  }, 30000);

  test("ex2 - UsernameField waits until the user leaves before it complains", async () => {
    const user = userEvent.setup();
    render(<UsernameField />);

    const field = screen.getByLabelText("Username");
    await user.type(field, "ab");

    expect(
      field,
      "two characters is too short, but the user is still typing. Shouting at " +
        "somebody halfway through their first word is the most common form " +
        "bug there is (README ex2)",
    ).toHaveAttribute("aria-invalid", "false");
    expect(field, "and there is nothing to describe yet").not.toHaveAccessibleDescription();

    await user.tab();
    expect(
      field,
      "leaving the field is the moment they finished. Now the rule applies",
    ).toHaveAttribute("aria-invalid", "true");
    expect(field, "and the message explains it").toHaveAccessibleDescription(
      "Username must be at least 3 characters",
    );

    await user.type(field, "c");
    expect(
      field,
      "once a field has been judged once, it must be judged on every keystroke " +
        "- making the user leave the box again to find out they fixed it is " +
        "unkind",
    ).toHaveAttribute("aria-invalid", "false");
    expect(field).not.toHaveAccessibleDescription();
  }, 30000);

  test("ex3 - PasswordPair puts the mismatch on the field that can fix it", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PasswordPair onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Set password" }));
    expect(
      screen.getByLabelText("Password"),
      "an empty password is a required-field error on the password itself " +
        "(README ex3)",
    ).toHaveAccessibleDescription("Password is required");
    expect(onSubmit).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText("Password"), "correct-horse");
    await user.type(screen.getByLabelText("Confirm password"), "correct-hors");
    await user.click(screen.getByRole("button", { name: "Set password" }));

    expect(onSubmit, "a mismatch is not a password").not.toHaveBeenCalled();
    expect(
      screen.getByLabelText("Confirm password"),
      "the mismatch belongs to the confirmation box, because that is the one " +
        "the user has to retype. A shared banner leaves them guessing which " +
        "field to touch",
    ).toHaveAccessibleDescription("Passwords do not match");
    expect(
      screen.getByLabelText("Password"),
      "and the password field itself is not at fault - do not mark both",
    ).toHaveAttribute("aria-invalid", "false");
    expect(screen.getByLabelText("Password")).not.toHaveAccessibleDescription();

    await user.type(screen.getByLabelText("Confirm password"), "e");
    await user.click(screen.getByRole("button", { name: "Set password" }));

    expect(onSubmit, "matching values go through, once").toHaveBeenCalledTimes(1);
    expect(onSubmit, "and the parent gets the password").toHaveBeenCalledWith("correct-horse");
  }, 30000);

  test("ex4 - BookingForm lists every problem and sends the user to the first", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<BookingForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Book" }));

    const summary = screen.queryByRole("alert");
    expect(
      summary,
      "three broken fields need one summary a screen reader is interrupted for, " +
        "which is role=alert (README ex4)",
    ).not.toBeNull();
    expect(summary, "it names the name problem").toHaveTextContent("Name is required");
    expect(summary, "the email problem").toHaveTextContent("Enter a valid email address");
    expect(summary, "and the guests problem").toHaveTextContent(
      "Guests must be between 1 and 8",
    );
    expect(
      screen.getByLabelText("Name"),
      "and focus moves to the first field that is wrong, so the keyboard user " +
        "is already where the work is. Focus left on the submit button means " +
        "they have to hunt",
    ).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText("Name"), "Ada");
    await user.click(screen.getByRole("button", { name: "Book" }));

    expect(
      screen.getByRole("alert"),
      "a fixed field drops out of the summary - the summary is derived from the " +
        "current errors, not appended to",
    ).not.toHaveTextContent("Name is required");
    expect(
      screen.getByLabelText("Email"),
      "and first now means the email, not the name",
    ).toHaveFocus();

    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Guests"), "3");
    await user.click(screen.getByRole("button", { name: "Book" }));

    expect(screen.queryByRole("alert"), "nothing is wrong, so nothing is announced").toBeNull();
    expect(onSubmit, "and the booking goes out with guests as a number").toHaveBeenCalledWith({
      name: "Ada",
      email: "ada@example.com",
      guests: 3,
    });
  }, 30000);

  test("ex5 - CouponField normalises the code before it judges it", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    render(<CouponField onApply={onApply} />);

    const field = screen.getByLabelText("Coupon code");
    await user.type(field, "abc-123");
    await user.click(screen.getByRole("button", { name: "Apply" }));

    expect(onApply, "three letters, a dash, four digits - this is three").not.toHaveBeenCalled();
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(
      field,
      "the message shows the shape rather than describing it: Coupon codes " +
        "look like ABC-1234 (README ex5)",
    ).toHaveAccessibleDescription("Coupon codes look like ABC-1234");

    await user.clear(field);
    await user.type(field, "  abc-1234  ");
    await user.click(screen.getByRole("button", { name: "Apply" }));

    expect(
      field,
      "spaces and lower case are how people type, not what they meant. " +
        "Normalise first, then test the normalised value",
    ).toHaveAttribute("aria-invalid", "false");
    expect(onApply, "one valid code, one call").toHaveBeenCalledTimes(1);
    expect(
      onApply,
      "and what goes out is the normalised code - sending the raw string means " +
        "the server has to know your trimming rules too",
    ).toHaveBeenCalledWith("ABC-1234");
  }, 30000);

  test("ex6 - DateRange refuses a range that runs backwards", () => {
    const onSubmit = vi.fn();
    render(<DateRange onSubmit={onSubmit} />);

    const start = screen.getByLabelText("Start date");
    const end = screen.getByLabelText("End date");

    expect(
      screen.getByRole("button", { name: "Check availability" }),
      "with no dates there is nothing to check (README ex6)",
    ).toBeDisabled();

    fireEvent.change(start, { target: { value: "2024-05-10" } });
    fireEvent.change(end, { target: { value: "2024-05-03" } });

    expect(
      screen.getByRole("button", { name: "Check availability" }),
      "both boxes are filled in, so the button is live - a disabled button " +
        "cannot explain what is wrong, which is why disabling is not validation",
    ).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Check availability" }));

    expect(onSubmit, "the third of May is before the tenth").not.toHaveBeenCalled();
    expect(end, "the end date is the one at fault").toHaveAttribute("aria-invalid", "true");
    expect(end).toHaveAccessibleDescription("End date cannot be before the start date");
    expect(
      start,
      "the start date is fine - a cross-field rule still has to pick one field " +
        "to blame, and it is the one the user typed last",
    ).toHaveAttribute("aria-invalid", "false");

    fireEvent.change(end, { target: { value: "2024-05-10" } });
    fireEvent.click(screen.getByRole("button", { name: "Check availability" }));

    expect(
      onSubmit,
      "the same day at both ends is a legal one-day booking: the rule is before, " +
        "not before-or-equal",
    ).toHaveBeenCalledWith({ start: "2024-05-10", end: "2024-05-10" });
    expect(end, "and the error is gone").toHaveAttribute("aria-invalid", "false");
  });

  test("ex7 - HandleField will not let you save a handle it has not cleared", async () => {
    const user = userEvent.setup();
    const first = deferred<boolean>();
    const second = deferred<boolean>();
    let calls = 0;
    const checkAvailable = vi.fn(() => (calls++ === 0 ? first.promise : second.promise));
    render(<HandleField checkAvailable={checkAvailable} />);

    const field = screen.getByLabelText("Handle");
    expect(
      screen.getByRole("button", { name: "Save" }),
      "nothing has been checked, so there is nothing to save (README ex7)",
    ).toBeDisabled();

    await user.type(field, "ada");
    await user.tab();

    expect(
      checkAvailable,
      "the check runs when the user leaves the field, with the handle they typed",
    ).toHaveBeenCalledWith("ada");
    expect(
      screen.getByRole("status"),
      "while the answer is on its way the user is told: Checking",
    ).toHaveTextContent("Checking");
    expect(
      screen.getByRole("button", { name: "Save" }),
      "and saving is impossible until the answer arrives - this is the window " +
        "where a double-click creates two accounts",
    ).toBeDisabled();

    await settle(first.promise, () => first.resolve(false));

    expect(field, "a taken handle is a field error").toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription("That handle is taken");
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();

    await user.type(field, "l");
    expect(
      field,
      "editing the handle makes the old verdict meaningless, so it has to go - " +
        "an error about a value the user has already changed is noise",
    ).toHaveAttribute("aria-invalid", "false");
    expect(field).not.toHaveAccessibleDescription();
    expect(screen.getByRole("status").textContent, "and the status clears with it").toBe("");

    await user.tab();
    await settle(second.promise, () => second.resolve(true));

    expect(checkAvailable, "the second check asks about the new handle").toHaveBeenLastCalledWith(
      "adal",
    );
    expect(screen.getByRole("status"), "a free handle is good news").toHaveTextContent("Available");
    expect(
      screen.getByRole("button", { name: "Save" }),
      "and only a checked, free handle unlocks Save",
    ).toBeEnabled();
  }, 30000);

  test("ex8 - ProfileSetup validates on the first attempt and guards the save", async () => {
    const user = userEvent.setup();
    const saved = deferred<void>();
    const onSubmit = vi.fn(() => saved.promise);
    render(<ProfileSetup onSubmit={onSubmit} />);

    const teamName = screen.getByLabelText("Team name");
    const website = screen.getByLabelText("Website");

    expect(
      teamName,
      "an empty form the user has not submitted yet is not a wrong form " +
        "(README ex8)",
    ).toHaveAttribute("aria-invalid", "false");
    expect(teamName).not.toHaveAccessibleDescription();

    await user.type(teamName, "Ad");
    await user.type(website, "example.com");
    await user.click(screen.getByRole("button", { name: "Create profile" }));

    expect(onSubmit, "two broken fields, no save").not.toHaveBeenCalled();
    expect(teamName).toHaveAccessibleDescription("Team name must be at least 3 characters");
    expect(website).toHaveAccessibleDescription("Website must start with https://");

    await user.type(teamName, "a");
    expect(
      teamName,
      "after the first attempt, every keystroke is judged - the user should not " +
        "have to press the button again to find out they fixed it",
    ).toHaveAttribute("aria-invalid", "false");
    expect(teamName).not.toHaveAccessibleDescription();

    await user.clear(website);
    await user.type(website, "https://example.com");
    await user.click(screen.getByRole("button", { name: "Create profile" }));

    expect(onSubmit, "now it is allowed out").toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ teamName: "Ada", website: "https://example.com" });

    const saving = screen.queryByRole("button", { name: "Saving" });
    expect(
      saving,
      "onSubmit returned a promise that has not settled, and the button has to " +
        "say so: Saving",
    ).not.toBeNull();
    expect(saving, "and it is disabled while it says it").toBeDisabled();

    await user.click(saving!);
    expect(
      onSubmit,
      "a second click during the save must do nothing at all - this is how one " +
        "checkout becomes two charges",
    ).toHaveBeenCalledTimes(1);

    await settle(saved.promise, () => saved.resolve());

    expect(screen.getByRole("status"), "and the user is told it worked").toHaveTextContent("Saved");
    expect(
      screen.queryByRole("button", { name: "Create profile" }),
      "with the save finished the button goes back to what it was",
    ).not.toBeNull();
  }, 30000);
});
```

<!-- GATE:END -->

Next: **d10_effects_basics**, where the component starts talking to the world
outside React.
