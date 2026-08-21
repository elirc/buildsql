# 00 — Hello, Dojo (React)

Welcome to the React track. This course teaches you React by making you write
it — every component, yourself. Nothing here scaffolds an answer or drops in a
snippet. You edit a `.tsx` file, you run one command, and an automated gate
renders your component, drives it the way a person would, and tells you whether
the result was right.

That last part is the thing that makes this track different from the others.
The TypeScript track can grade a function by calling it. There is no equivalent
for a component, because a component's output is not a return value you inspect
— it is a piece of a user interface. So every gate in this track does what a
user does: it renders your component into a real DOM (jsdom, in-process, no
browser and no dev server), it looks for a *button* or a *heading* or a *text
box with this label*, it clicks and types, and then it asserts on what a person
would now see.

That has a consequence worth internalising before you write a line. **The gate
can only find what is accessible.** A `<div onClick=…>` styled to look like a
button is invisible to `getByRole("button")`, and it is invisible to a screen
reader for the same reason. An icon-only control with no label announces itself
as nothing at all. In this course, accessibility is not a bonus module at the
end — it is the API the grader uses, so you get it right on day one or you do
not pass.

## The loop

Every lesson is a directory under `tracks/react/lessons/`. Inside:

- `README.md` — this file. Read it top to bottom before you write anything.
- `reading.md` — the theory. Read it *after* you attempt the exercises.
- `ex1/`, `ex2/`, … — one directory per exercise. You edit `exN/solution.tsx`
  and nothing else.
- `gate.test.tsx` — the gate. It is quoted verbatim at the bottom of this
  README, and always will be. You are never graded by a program you have not
  been shown.

The commands you will live in:

```
uv run dojo test react 00_hello_dojo        # grade the whole lesson
uv run dojo test react 00_hello_dojo ex2    # grade just one exercise
uv run dojo hint react 00_hello_dojo ex2    # stuck? reveal the next tier
uv run dojo read react 00_hello_dojo ex2    # the theory behind it
uv run dojo status react                    # the progress dashboard
uv run dojo next react                      # what should I do now?
```

Before you write anything, run the gate and watch it fail:

```
uv run dojo test react 00_hello_dojo
```

Three red tests. That is the correct state of a fresh checkout, and reading a
failure you *expected* is the cheapest way to learn to read the ones you don't.
Notice the shape of the output: a sentence written for you, then vitest's diff
showing what the DOM actually contained. When a query finds nothing at all,
Testing Library prints the entire rendered HTML plus a list of every accessible
role it *did* find. That list is usually the answer.

## Concept — a component is a function that returns markup

Here is the whole idea:

```tsx
export function Ticket({ code }: { code: string }) {
  return <p>Your ticket is {code}.</p>;
}
```

Three things are happening. The function is **capitalised**, which is how JSX
tells a component apart from an HTML tag — `<ticket />` compiles to a literal
`<ticket>` element, `<Ticket />` calls your function. It takes a single
argument, the **props object**, which is destructured here into `{ code }`. And
it returns **JSX**: markup-shaped syntax that compiles to ordinary function
calls, so it can appear anywhere a value can.

Inside JSX, curly braces switch back into JavaScript:

```tsx
const total = 3;
const el = <p>You have {total} {total === 1 ? "ticket" : "tickets"} left.</p>;
```

Everything outside the braces is literal text. Everything inside is an
expression — not a statement, so `if` and `for` do not go there, but a ternary
and a function call do. The same braces work in attribute position:

```tsx
<a href={`/tickets/${code}`} aria-label={`Ticket ${code}`}>view</a>
```

An attribute in braces takes any value, including a function. That is how
events are wired:

```tsx
<button type="button" onClick={handleClick}>Buy</button>
```

Read that carefully: `onClick={handleClick}` hands React the function.
`onClick={handleClick()}` *calls* it while rendering and hands React whatever
came back — a bug you will write at least once, and one the gates in this
course catch immediately.

One last piece of vocabulary, because the gates are written in it. Every
element has an implicit **role** (a `<button>` has role `button`, an `<h1>` has
role `heading` at level 1) and an **accessible name** — the text a screen
reader announces for it. The name usually comes from the element's own content,
but `aria-label` overrides it. So this button *shows* an ✕ and *announces*
"Close panel":

```tsx
<button type="button" aria-label="Close panel">✕</button>
```

Roles and names are what `screen.getByRole("button", { name: "Close panel" })`
searches on. Learn to think in them and half of Testing Library disappears.

## Exercise 1 — your first component

Edit `ex1/solution.tsx`. `Greeting` takes a `name` prop and must render a
**level-1 heading** — an `<h1>` — reading:

- with `name="Eli"` → `Hello, Eli! Welcome to the dojo.`
- with `name="Ada"` → `Hello, Ada! Welcome to the dojo.`

Exact text, including the comma, the exclamation mark and the final full stop.
The heading element matters as much as the words: the gate asks for role
`heading` at level 1, so a `<div>` with large text will not be found no matter
what it says.

```
uv run dojo test react 00_hello_dojo ex1
```

## Exercise 2 — a decision the props cannot make for you

Edit `ex2/solution.tsx`. `TrackSummary` takes `track` and `lessons` and renders
a single paragraph:

- `track="react"`, `lessons={15}` → `react: 15 lessons`
- `track="node"`, `lessons={1}` → `node: 1 lesson`
- `track="csharp"`, `lessons={0}` → `csharp: 0 lessons`

Read those three lines again. Two are the same shape and one is not: English
pluralises on "exactly one", so zero is plural. Your component has to make that
decision while it renders — there is no single piece of JSX that produces all
three.

This gate compares the component's entire rendered text, trimmed, so render one
element and nothing else.

```
uv run dojo test react 00_hello_dojo ex2
```

## Exercise 3 — seen, heard, and clicked

Edit `ex3/solution.tsx`. `IconButton` takes three props — `label`, `glyph` and
`onPress` — and must render a real `<button>` that:

- **shows** the `glyph` (the gate renders it with `glyph="x"`),
- **announces** the `label` as its accessible name (`label="Close panel"`),
- calls `onPress` once per click.

The gate clicks it twice with `user-event`, which drives the real DOM event
sequence a browser produces — pointer down, focus, pointer up, click — rather
than calling your handler directly. If your control is not focusable and
clickable, that fails, which is the point.

```
uv run dojo test react 00_hello_dojo ex3
```

## The gate

This is the entire gate, `gate.test.tsx`:

<!-- GATE:BEGIN -->

```tsx
// Gate for react/00_hello_dojo. Quoted verbatim in README.md.
// One test per exercise; the title starts with the exercise directory name so
// `dojo test react 00_hello_dojo ex2` can select just that one.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { Greeting } from "./ex1/solution";
import { TrackSummary } from "./ex2/solution";
import { IconButton } from "./ex3/solution";

describe("00_hello_dojo", () => {
  test("ex1 - Greeting renders a level-1 heading built from its name prop", () => {
    const { unmount } = render(<Greeting name="Eli" />);
    expect(
      screen.getByRole("heading", { level: 1 }),
      "the level-1 heading must read exactly: Hello, Eli! Welcome to the dojo. " +
        "- compare it character by character, punctuation included (README ex1)",
    ).toHaveTextContent("Hello, Eli! Welcome to the dojo.");
    unmount();

    render(<Greeting name="Ada" />);
    expect(
      screen.getByRole("heading", { level: 1 }),
      "the name has to come from the prop, not be hard-coded - reread README ex1",
    ).toHaveTextContent("Hello, Ada! Welcome to the dojo.");
  });

  test("ex2 - TrackSummary agrees with its own number", () => {
    const many = render(<TrackSummary track="react" lessons={15} />);
    expect(
      many.container.textContent?.trim(),
      "TrackSummary should render one paragraph reading: react: 15 lessons",
    ).toBe("react: 15 lessons");
    many.unmount();

    const one = render(<TrackSummary track="node" lessons={1} />);
    expect(
      one.container.textContent?.trim(),
      "one lesson is a lesson, not lessons - the plural is a decision your " +
        "component has to make, not a template you can write once",
    ).toBe("node: 1 lesson");
    one.unmount();

    const none = render(<TrackSummary track="csharp" lessons={0} />);
    expect(
      none.container.textContent?.trim(),
      "zero is plural in English - expect: csharp: 0 lessons",
    ).toBe("csharp: 0 lessons");
  });

  test("ex3 - IconButton has an accessible name and reports its clicks", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<IconButton label="Close panel" glyph="x" onPress={onPress} />);

    const button = screen.getByRole("button");
    expect(
      button,
      "a screen reader announces the accessible name, and yours is the glyph. " +
        "Give the button an aria-label so it is announced as: Close panel",
    ).toHaveAccessibleName("Close panel");
    expect(
      button,
      "the glyph is still what a sighted user sees, so it belongs in the " +
        "button's visible content - reread README ex3",
    ).toHaveTextContent("x");

    await user.click(button);
    await user.click(button);
    expect(
      onPress,
      "each click on the button must call the onPress prop exactly once - " +
        "wire it to the button's onClick",
    ).toHaveBeenCalledTimes(2);
  });
});
```

<!-- GATE:END -->

In plain English:

- **ex1** renders your `Greeting` twice, with two different names, and each
  time asks the DOM for "the level-1 heading" and compares its text. Rendering
  twice is how the gate proves the name came from the prop rather than from a
  hard-coded string that happened to match the first case.
- **ex2** renders `TrackSummary` three times — plural, singular, and zero — and
  reads back the whole rendered text.
- **ex3** finds the one button on the page, checks its *accessible name*
  separately from its *visible text* (they are deliberately different), then
  clicks it twice and checks the `vi.fn()` spy passed as `onPress` was called
  exactly twice. `vi.fn()` is a recording stand-in: it does nothing but
  remember how it was called. Injecting fakes like this instead of reaching
  into your component is how every gate in this track stays honest, and by
  lesson 07 the same trick is what lets us grade network code with no network.

## The teaching point

The habit this lesson builds is *predicting the failure*. You ran the gate
before writing anything, so you know what red looks like; every red run after
this is a comparison against something rather than a surprise.

The second habit is the one that will still be paying you back in five years:
describe the UI the way a person perceives it. "The level-1 heading", "the
button called Close panel", "the text box labelled Email" are durable
descriptions — they survive a refactor, a CSS rewrite, a component library
swap. "The second `<div>` inside the wrapper" survives none of those, and it is
the reason so many test suites get deleted. Every gate in this track is written
in the durable vocabulary, and so, from now on, is your markup.

Next: **01_components_jsx**, where JSX stops being a curiosity and starts
having rules.
