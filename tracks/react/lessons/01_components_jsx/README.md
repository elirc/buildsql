# 01 — Components and JSX

In lesson 00 you wrote three components and the JSX mostly did what it looked
like it would do. That is by design: JSX is engineered to be guessable. But
"mostly" is where the bugs live, and every one of them comes from the same
fact — **JSX is not HTML and it is not a template language. It is JavaScript.**

`<p>hi</p>` is not markup that gets parsed at runtime. It is syntax that your
build step rewrites into a function call, roughly `jsx("p", { children: "hi" })`,
which returns a plain object describing an element. That object is a value like
any other: you can put it in a `const`, return it from a function, pass it as a
prop, or stick it in an array. Everything surprising about JSX follows from
that one sentence, and this lesson is the four consequences you meet first.

The first: **a function returns one value**, so a component returns one
element. The second: **attributes are JavaScript property names**, so `class`
(a reserved word) is `className` and `for` is `htmlFor`. The third: **braces
hold an expression, not a statement** — a ternary is fine, an `if` is not. The
fourth: because the whole thing is code, an attribute's value can be *computed*,
which is how one component renders two different things.

## Concept — the four rules, with a worked example

Here is a component that uses all of them:

```tsx
export function Receipt({ id, items, paid }: { id: string; items: number; paid: boolean }) {
  const status = paid ? "Paid" : "Unpaid";

  return (
    <article className="receipt" aria-label={`Receipt ${id}`}>
      <h2>{status}</h2>
      <p>
        {items} {items === 1 ? "item" : "items"}
      </p>
    </article>
  );
}
```

**One root.** The `<h2>` and the `<p>` are siblings, so something has to
contain them; here it is the `<article>`. When you genuinely do not want a
wrapper element in the output — because the parent is a `<dl>`, a `<tr>` or a
flex container whose direct children are being laid out — use a **fragment**,
which groups children and then renders nothing itself:

```tsx
return (
  <>
    <dt>{label}</dt>
    <dd>{value}</dd>
  </>
);
```

`<>…</>` is shorthand for `<React.Fragment>…</React.Fragment>`. It exists
precisely because "wrap it in a div" is not always a legal move: a `<div>`
between `<dl>` and `<dt>` is invalid HTML, and a stray wrapper inside a grid
silently breaks the layout.

**Attributes are property names.** `className`, `htmlFor`, `tabIndex`,
`onClick` — camelCase, because these are keys in a JavaScript object. The
exceptions are the `data-*` and `aria-*` families, which keep their dashes
(`aria-label`, `data-testid`) because they were always strings, not properties.

**Braces hold expressions.** `{status}`, `{items === 1 ? "item" : "items"}`,
`` {`Receipt ${id}`} `` are all fine. `{if (paid) …}` is a syntax error. When
the logic outgrows a ternary, compute it above the `return` and interpolate the
result — that is what `const status` is doing, and it is what experienced React
code looks like.

**Attributes can be computed.** `aria-label={`Receipt ${id}`}` is the small
version. The large version is choosing the attribute's value from a prop:

```tsx
<p role={urgent ? "alert" : "status"}>{message}</p>
```

Note the two returns you now have available for "render one thing or another":
a ternary *inside* JSX, and an early `return` *before* it. The second is
usually clearer when whole elements differ rather than one value.

One more habit, since the gates run on it. `role="alert"` and `role="status"`
mark **live regions** — parts of the page a screen reader announces when they
change without the user doing anything. `alert` interrupts; `status` waits for
a natural pause. Errors are alerts; "Draft saved" is a status.

## Exercise 1 — one root element

Edit `ex1/solution.tsx`. `PageHeader({ title, subtitle })` must render a
`<header>` containing a level-1 heading with the `title` and a paragraph with
the `subtitle`. The gate finds the header by its `banner` role and then looks
*inside* it for the other two, so the nesting is part of the answer.

```
uv run dojo test react 01_components_jsx ex1
```

## Exercise 2 — text braces and attribute braces

Edit `ex2/solution.tsx`. `ProfileLink({ name, href })` renders one anchor whose
visible text is `Open ` followed by the name — with `name="Ada"` that is
`Open Ada` — and whose `href` attribute is the `href` prop, unchanged.

An `<a>` with no `href` has no `link` role at all, which is a rule of the
platform rather than a quirk of the gate: a link that goes nowhere is not a
link.

```
uv run dojo test react 01_components_jsx ex2
```

## Exercise 3 — two siblings, no wrapper

Edit `ex3/solution.tsx`. `LabelledField({ label, value })` renders the label in
a `<dt>` and the value in a `<dd>` — two sibling elements, and **no wrapper
element around them**.

The gate renders two of your components inside a `<dl>` and then inspects that
`<dl>`'s direct children: it expects exactly `dt, dd, dt, dd`. Anything you
wrap them in shows up there and fails.

```
uv run dojo test react 01_components_jsx ex3
```

## Exercise 4 — an attribute computed from a prop

Edit `ex4/solution.tsx`. `Notice({ tone, message })` renders the `message`
inside a live region whose role depends on `tone`:

- `tone="error"` → `role="alert"`
- `tone="info"` → `role="status"`

The gate renders it once with each tone and checks that the *other* role is not
present, so a component that always renders both regions does not pass.

```
uv run dojo test react 01_components_jsx ex4
```

## Challenge — the same component, two different elements

Edit `challenge/solution.tsx`. A breadcrumb trail is a row of links ending in
the page you are currently on, and that last one **must not be a link** —
linking to the page you are already viewing is a trap for keyboard and
screen-reader users, who tab to it, activate it, and go nowhere.

`Crumb({ label, href, current })` renders:

- when `current` is `false`: an anchor whose text is the `label` and whose
  `href` is the `href`;
- when `current` is `true`: **not a link** — an element carrying the label as
  its text and the attribute `aria-current="page"`.

Honest difficulty note: this previews conditional rendering, which
`04_lists_conditional` covers properly. The hints teach you the one form you
need, and the form is small.

```
uv run dojo test react 01_components_jsx challenge
```

## Review — wiring a field together

`review1/solution.tsx` is scheduled by `dojo review`, not by this lesson's
completion. `Field({ id, label, hint })` renders three siblings with no
wrapper: a `<label>` bound to the input by `htmlFor`, an `<input>` carrying the
given `id`, and an element holding the `hint` text that the input points at
with `aria-describedby`.

```
uv run dojo test react 01_components_jsx review1
```

## The gate

This is the entire gate, `gate.test.tsx`:

<!-- GATE:BEGIN -->

```tsx
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
```

<!-- GATE:END -->

In plain English:

- **ex1** asks for the `banner` role, then searches *within* that element for
  the heading and the paragraph. `within(el)` scopes a query to a subtree,
  which is how a gate asserts on structure without naming your class names.
- **ex2** finds the one link, checks its accessible name (which, for a link
  with no `aria-label`, is its visible text) and its `href` attribute
  separately — one comes from children, the other from an attribute.
- **ex3** collects every `term` and `definition` role and compares the text
  arrays, then reads the `<dl>`'s `children` and compares tag names. That last
  check is the fragment check: a wrapper element would make the list one child
  long instead of four.
- **ex4** renders with `tone="error"`, asserts an `alert` exists, then
  `rerender`s with `tone="info"` and asserts the alert is *gone* and a `status`
  is present. `rerender` re-renders the same component with new props, exactly
  as a parent would.
- **challenge** checks the link case, then re-renders as the current page and
  asserts `queryByRole("link")` finds nothing. `queryBy*` returns `null`
  instead of throwing, which makes it the only family you can use to assert
  something is absent.
- **review1** finds the input *by its label* and asserts its accessible
  description — two separate wires, both made of ids.

## The teaching point

Every rule in this lesson is a consequence of JSX being JavaScript, and once
you hold that, you stop memorising them. The fragment is not a React feature
you have to remember; it is the answer to "a function returns one value, but I
need two elements". `className` is not a gotcha; it is what the property is
called. And `role={tone === "error" ? "alert" : "status"}` is not a special
templating syntax — it is an expression in a place where a value goes.

The other thing you have started doing, whether you noticed or not, is picking
elements for meaning rather than appearance. `<header>`, `<dt>`, `<a href>`,
`role="alert"` all carry information no `<div>` can. In production that is the
difference between a UI that works with a screen reader, a browser's reader
mode, and a search-engine crawler, and one that only works if you can see it.

Next: **02_props_composition**, where components start containing each other.
