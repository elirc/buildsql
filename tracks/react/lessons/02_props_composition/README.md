# 02 — Props and composition

So far every component you have written has been a leaf: props in, markup out,
nothing inside it but HTML. Real interfaces are not built that way. A settings
page is a card containing a list containing rows containing buttons, and the
card knows nothing about the buttons. The mechanism that lets a component
contain something it has never heard of is **composition**, and it is the
reason React scales past a few hundred lines.

The idea is small enough to state in one line: since JSX is a value, a
component can be *handed* JSX. Everything in this lesson is a variation on
that. `children` is JSX handed in between the tags. A slot prop is JSX handed
in by name. Spreading is a whole *bag* of props handed through untouched. And
the thing you are avoiding by doing any of this is the alternative — a
component with fourteen boolean props, each one adding a branch, none of them
ever quite what the next caller needed.

There is a name for the two approaches, and it is worth having in your head
before an interview. **Configuration** is `<Card hasFooter footerText="Save" />`.
**Composition** is `<Card footer={<button>Save</button>} />`. The first works
until someone wants two buttons and an icon; the second never has that problem,
because `Card` was never in the business of describing footers in the first
place.

## Concept — four ways to hand a component something

**1. `children`.** Anything between a component's tags arrives as a prop
called `children`:

```tsx
function Bordered({ children }: { children: ReactNode }) {
  return <div className="bordered">{children}</div>;
}

<Bordered>
  <p>Anything at all.</p>
</Bordered>
```

`children` is an ordinary prop with syntax sugar — `<Bordered children={<p/>} />`
is legal and means the same thing. It is typed `ReactNode`, which is React's
"anything renderable": elements, strings, numbers, arrays of those, `null`,
`undefined`, `false`.

**2. Named slots.** When there is more than one hole to fill, `children` runs
out and you pass JSX by name:

```tsx
<Layout sidebar={<Nav />} main={<Article />} />
```

Nothing about this is special syntax. `sidebar` is a prop that happens to hold
an element, and `Layout` renders it with `{sidebar}` like any other value.

**3. Defaults.** Optional props are declared with `?` and defaulted in the
destructuring pattern:

```tsx
function Avatar({ name, size = 40 }: { name: string; size?: number }) {
```

The default applies when the prop is `undefined` — which includes "not passed
at all" — and *only* then. `size={0}` stays `0`. Putting the default in the
destructuring rather than writing `const size = props.size || 40` matters for
exactly that reason: `||` also swallows `0` and `""`.

**4. Rest and spread.** A wrapper component usually cares about two or three
props and should pass the rest through untouched:

```tsx
function Field({ label, id, ...rest }: FieldProps) {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} {...rest} />
    </>
  );
}

<Field label="Email" id="email" type="email" required />
```

`...rest` collects everything not named; `{...rest}` in JSX pours it back out
as attributes. Order matters — anything you write after the spread overrides
what was in it. The TypeScript idiom for "my props plus every prop a real
`<input>` takes" is `{ label: string; id: string } & ComponentProps<"input">`.

One rule underneath all of this: **props are read-only**. A component may never
assign to the props object it was given. Data flows down; when a child needs to
change something above it, the parent passes a *function* down and the child
calls it. You did that in lesson 00 with `onPress`, and you will do it in every
lesson from here on.

## Exercise 1 — children

Edit `ex1/solution.tsx`. `Card({ title, children })` renders an `<article>`
containing a level-3 heading with the `title`, followed by the `children`. The
gate passes a paragraph between the tags and checks that it reached the DOM,
and that the title comes first.

```
uv run dojo test react 02_props_composition ex1
```

## Exercise 2 — an optional prop with a default

Edit `ex2/solution.tsx`. `Rating({ value, max })` renders a run of star
characters as a single labelled image:

- the element carries `role="img"` and an `aria-label` reading exactly
  `3 out of 5 stars` (for `value={3}` with no `max`);
- `max` defaults to `5` when it is not passed;
- a sighted user sees one filled star (`★`) per point of `value` — whether you
  also draw the unfilled `☆` remainder is up to you.

Why `role="img"`? Because `★★★` read out character by character is noise. Text
that is really a picture should announce itself as a picture with a name.

```
uv run dojo test react 02_props_composition ex2
```

## Exercise 3 — slots

Edit `ex3/solution.tsx`. `Panel({ header, footer, children })` renders three
regions in that order: the `header`, then the `children`, then the `footer`.
All three arrive as JSX — the gate passes an `<h2>` and a whole `<button>` —
and `Panel`'s only job is to place them.

```
uv run dojo test react 02_props_composition ex3
```

## Exercise 4 — forwarding the props you do not own

Edit `ex4/solution.tsx`. `TextField({ label, id, ...rest })` renders a `<label>`
joined to an `<input>` by `htmlFor`/`id`, with **no wrapper element**, and
forwards every other prop it was given to the `<input>`.

The gate passes `type`, `placeholder` and `maxLength` — none of which
`TextField` should have to know about — and checks all three landed on the
input.

```
uv run dojo test react 02_props_composition ex4
```

## Challenge — an accessible dialog

Edit `challenge/solution.tsx`. `Modal({ title, children, onClose })` renders:

- an element with `role="dialog"` and `aria-modal="true"`;
- an accessible name equal to the `title`, taken from the heading that displays
  it (not from an `aria-label` duplicating the string);
- the `children`, inside the dialog;
- a `<button>` whose accessible name is `Close`, calling `onClose` when clicked.

Honest difficulty note: the naming wire is the hard part, and it needs a unique
id. `useId()` is a hook — your first — and the hints tell you the one line you
need. Hooks proper start in lesson 03.

```
uv run dojo test react 02_props_composition challenge
```

## Review — the media object

`review1/solution.tsx`. `MediaObject({ media, children })` renders the `media`
slot first and the `children` second. The gate hands it a finished `<img>` and
a paragraph and checks both appear, in that order.

```
uv run dojo test react 02_props_composition review1
```

## The gate

This is the entire gate, `gate.test.tsx`:

<!-- GATE:BEGIN -->

```tsx
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
```

<!-- GATE:END -->

In plain English:

- **ex1** looks for the heading, then for the caller's paragraph by its text,
  then reads the whole rendered text and requires the title to appear before
  the children.
- **ex2** renders once with no `max` and checks the accessible name says
  `out of 5`, which only happens if the default fired; then renders with
  `max={3}` to prove the default did not overwrite an explicit value.
- **ex3** finds the header's heading and the footer's button, then checks all
  three regions appear in order in the rendered text.
- **ex4** finds the input *by its label* and then checks three attributes that
  `TextField` was never told about individually.
- **challenge** asks for the dialog role, its accessible name and its
  `aria-modal` attribute, checks the children are inside it with `within(...)`,
  then clicks Close and checks the spy.
- **review1** uses `compareDocumentPosition`, a DOM method that returns `4`
  when the argument comes *after* the node you called it on — a precise way to
  say "the image is before the text" without caring how you nested them.

## The teaching point

The habit worth taking from this lesson is asking, of every prop you are about
to add: *is this a decision, or is it content?* Decisions belong to the
component — `max`, the ordering of the three regions, whether the dialog is
modal. Content belongs to the caller, and the caller should hand it over
already built. Every time you turn content into configuration (`footerText`,
`iconName`, `showBadge`) you take on the job of anticipating what people will
want, and you will be wrong.

The second habit is smaller and pays daily: forward what you do not own.
Wrapper components that swallow `className`, `aria-*`, `data-*` and `onBlur`
are the reason design-system components get forked. `...rest` costs one line
and keeps your component honest about its actual responsibilities.

Next: **03_state_events**, where components start remembering things.
