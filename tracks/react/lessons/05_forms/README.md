# 05 — Forms

A text input is the one HTML element with a mind of its own. Render `<input />`
and the browser gives it a value, updates that value as the user types, and
keeps it — without telling React anything. That is fine until you want to
uppercase the text, disable a button while the field is empty, validate before
submitting, or show a live preview. At that point there are two sources of
truth for the same string, and they will disagree.

React's answer is to take the field over. A **controlled** input renders its
value from state and reports every change back through `onChange`, so state and
screen cannot drift: what the user sees *is* your state, one render behind
nothing. The alternative — an **uncontrolled** input, where the DOM keeps the
value and you read it when you need it — is not wrong, and you have already
used it in lesson 04's key demonstration. But controlled is the default, and it
is what interviewers mean when they ask you the difference.

This lesson also covers the part of forms that is not about React at all:
telling somebody what went wrong. An error message that a sighted user can see
floating next to a field is invisible to a screen-reader user unless it is
*wired* to that field. Two attributes fix that, and the challenge makes you
use them.

## Concept — value in, change out

```tsx
function Search() {
  const [query, setQuery] = useState("");

  return (
    <>
      <label htmlFor="q">Search</label>
      <input id="q" value={query} onChange={(event) => setQuery(event.target.value)} />
      <p>Searching for: {query}</p>
    </>
  );
}
```

`value` and `onChange` travel together. `value` with no `onChange` gives a box
that cannot be typed into (and a React warning saying so); `onChange` with no
`value` leaves the browser in charge and your state as a stale copy.

Read the loop carefully, because it is not what it looks like. The keystroke
does not change the input. The keystroke fires `onChange`; you set state; React
re-renders; the input's `value` attribute is set from the new state. The
display is *always* your state. That is why uppercasing in the handler works,
and it is why a controlled input with a handler that does nothing is a box you
cannot type in.

**Each control reports differently:**

| control | you set | you read |
|---|---|---|
| text, textarea, `<select>` | `value` | `event.target.value` |
| checkbox | `checked` | `event.target.checked` |
| radio group | `checked` per option | `event.target.value` of the checked one |

The checkbox row is the one people get wrong. A checkbox's `value` is the
string `"on"` whether it is ticked or not; the state you want is `checked`.

Note also that React puts `value` on the `<select>` itself rather than marking
an `<option selected>` — a deliberate departure from HTML that keeps the whole
control in one place.

**Many fields, one object.** Rather than a `useState` per field, one object plus
one handler scales:

```tsx
const [form, setForm] = useState({ name: "", email: "" });

function handleChange(event) {
  const { name, value } = event.target;
  setForm((previous) => ({ ...previous, [name]: value }));
}
```

The `name` attribute on each input is what makes one handler able to serve all
of them, and `{ ...previous }` is what stops each keystroke wiping the other
fields — state objects are replaced, never edited.

**Submitting.** Put the handler on the `<form>`, not on the button, so that
pressing Enter in a field works the way users expect:

```tsx
function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  …
}
```

`preventDefault()` stops the browser navigating away — the default action of a
form submit is a full page load, which in a single-page app throws your whole
application away.

**Errors have to be attached to fields.** Two attributes:

- `aria-invalid="true"` on the control, so it announces itself as invalid;
- `aria-describedby="<id of the message>"`, so the message is read out after
  the field's label.

A `role="alert"` summary at the top of the form is good for "here is everything
that went wrong"; per-field wiring is what makes each field self-describing
when you tab into it. Real forms usually want both.

## Exercise 1 — a controlled input

Edit `ex1/solution.tsx`. `NameField` renders an input labelled `Full name` and
a live region. The input must be controlled, and whatever the user types must
appear **in upper case in the box itself**. The live region reads
`<n> characters`, for example `3 characters`, and goes back to `0 characters`
when the field is cleared.

```
uv run dojo test react 05_forms ex1
```

## Exercise 2 — a checkbox and a select

Edit `ex2/solution.tsx`. `Preferences` renders a `<select>` labelled `Theme`
with the options `light`, `dark` and `system` (that is their `value`; the
visible labels are already in the stub), and a checkbox labelled
`Email me updates`. Both must be controlled.

A live region summarises both, reading exactly:

```
Theme: light, emails off
```

with the theme being the selected option's value and the last word being `on`
or `off`.

```
uv run dojo test react 05_forms ex2
```

## Exercise 3 — two fields, one state object

Edit `ex3/solution.tsx`. `SignupForm` has inputs labelled `Name` and `Email`,
both controlled from a single state object, both using the **same**
`handleChange`. A live region shows `Ada <ada@example.com>`.

The stub's handler is deliberately broken in the most common way. Type into the
second field and watch the first one empty itself.

```
uv run dojo test react 05_forms ex3
```

## Exercise 4 — validate before submitting

Edit `ex4/solution.tsx`. `LoginForm({ onSubmit })` has controlled `Email` and
`Password` fields and a submit button reading `Sign in`. On submit:

- if the email does not contain an `@`, the form must show the message
  `Enter a valid email address`;
- if the password is shorter than 8 characters, it must show
  `Password must be at least 8 characters`;
- both messages appear inside an element with `role="alert"`, and that element
  must not exist at all when there is nothing wrong;
- `onSubmit` is called — once, with `{ email, password }` — only when the form
  is valid.

```
uv run dojo test react 05_forms ex4
```

## Challenge — errors that belong to fields

Edit `challenge/solution.tsx`. `AddressForm({ onSubmit })` has controlled
`Street` and `Postcode` fields and a `Save address` button. Street is required;
postcode must be exactly four digits. On an invalid submit, **each broken field**
carries:

- `aria-invalid="true"` (and `aria-invalid="false"` when it is fine — the
  attribute must be present either way, so the gate can tell "valid" from
  "never checked");
- an accessible description equal to its message: `Street is required` or
  `Postcode must be four digits`.

`onSubmit` is called with `{ street, postcode }` only when both are valid.

Honest difficulty note: the shape of the error state is the whole exercise. A
flat array cannot say which field a message belongs to.

```
uv run dojo test react 05_forms challenge
```

## Review — derived enablement

`review1/solution.tsx`. `NewsletterForm({ onSubscribe })` has a controlled
`Email` field and a controlled checkbox labelled `I agree to the terms`. The
`Subscribe` button is disabled until the email is non-blank **and** the box is
ticked; clicking it calls `onSubscribe(email)`.

```
uv run dojo test react 05_forms review1
```

## The gate

This is the entire gate, `gate.test.tsx`:

<!-- GATE:BEGIN -->

```tsx
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
```

<!-- GATE:END -->

In plain English:

- **ex1** types three lower-case letters and asserts the box shows three
  upper-case ones — which can only be true if the box renders state — then
  clears it and checks the counter went back to zero.
- **ex2** checks the defaults, changes the select with `selectOptions`, checks
  the summary, then clicks the checkbox and checks it again. Every query is by
  label, so the labels have to be wired.
- **ex3** types into both fields and then checks *both* still hold their values,
  which is the assertion the broken stub fails.
- **ex4** submits bad values and checks the alert says both things and
  `onSubmit` was not called; then fixes both fields and checks the alert is gone
  and `onSubmit` received the exact object.
- **challenge** checks `aria-invalid` and the accessible *description* on the
  bad field, checks the good field is explicitly marked valid, then fixes the
  postcode and checks both the flag and the submission.
- **review1** asserts the button is disabled, still disabled with only an
  email, enabled once the box is ticked, and that clicking it calls back with
  the email.

## The teaching point

Controlled inputs are an instance of a bigger idea: **one source of truth**.
The moment two places both remember the same fact — the DOM and your state, a
derived list and its source, `isValid` and the values it was computed from —
you own the job of keeping them in step, and you will eventually fail at it.
Controlled inputs cost a little ceremony and delete that whole category.

The accessibility half of this lesson is where React developers are weakest and
where interviewers for senior roles increasingly probe. "How do you associate
an error message with an input?" has a specific answer —
`aria-describedby` plus `aria-invalid` — and knowing it signals that you have
shipped a form somebody actually had to use.

Next: **06_effects**, where you step outside React entirely, and pay for it.
