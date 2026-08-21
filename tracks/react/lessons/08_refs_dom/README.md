# 08 — Refs and the DOM

Everything so far has been declarative: you describe the UI, React makes the
DOM match. That covers most of what a UI needs, and then there is the residue.
You cannot describe "this input is focused". You cannot describe "scroll this
element into view", "play this video", "measure how tall that is", or "select
the text in that box". Those are **imperative** operations on a real node, and
for them you need the node.

`useRef` is how you get it. It is a small hook with two quite different jobs,
and confusing them is where most ref bugs come from.

The first job is the one everybody meets first: a ref attached to a JSX element
gives you that element's DOM node. The second is subtler and just as useful: a
ref is **a box that survives re-renders and does not cause them**. State that
nobody looks at — the id of a timer you need to cancel, a count you only read in
a handler, the previous value of a prop — belongs in a ref, because putting it
in state would render the component for no visible reason.

The rule that keeps both jobs straight: **if changing it should change what is
on screen, it is state. If it should not, it is a ref.**

## Concept — a box, and sometimes a node

```tsx
const field = useRef<HTMLInputElement>(null);
const timerId = useRef<number | null>(null);
```

`useRef(initial)` returns `{ current: initial }` — the *same object* on every
render, so writing `field.current = x` persists, and writing it never schedules
a render. That is the whole API.

**As a DOM handle.** Pass the ref to an element's `ref` attribute and React
fills it in when it commits the node, and sets it back to `null` when the node
is removed:

```tsx
<input ref={field} />
```

Two consequences follow. During render `field.current` is still whatever it was
*before* this render committed, so reading it while rendering is meaningless —
which is why every DOM operation goes in an effect or an event handler. And the
node can be gone, so `field.current?.focus()` rather than `field.current.focus()`.

**As a mutable box.** No element, no `ref` attribute, just persistence:

```tsx
const renders = useRef(0);
renders.current += 1;             // no re-render, ever
```

Compare the alternatives: a module-level `let` would be shared by every
instance of the component, and a `let` inside the body would reset on every
render. A ref is per-instance and persistent, which is exactly the gap.

**Passing a ref through your own component.** In React 19, `ref` is an ordinary
prop for function components, so a wrapper forwards it by handing it on:

```tsx
function FancyInput({ label, ref }: { label: string; ref?: Ref<HTMLInputElement> }) {
  return <input ref={ref} />;
}
```

Before React 19 this required `forwardRef`, which you will still meet in
existing code; it does the same thing with more ceremony.

**Choosing what the parent gets.** Sometimes the DOM node is the wrong thing to
hand over — the parent would then be able to do *anything* to it, including
things that fight with React. `useImperativeHandle` lets you expose a small
object of your own design instead:

```tsx
useImperativeHandle(ref, () => ({
  focus: () => field.current?.focus(),
  clear: () => setText(""),
}), []);
```

Now `ref.current` is that object and nothing else. Use this sparingly: it is an
escape hatch from one-way data flow, and every method you expose is a promise
you have to keep. But for "focus me", "reset me", "scroll to me" it is the
right tool, and it is what real component libraries do.

**A word on when *not* to reach for refs.** Do not read or write DOM state that
React is managing — setting `input.value` directly on a controlled input, adding
a class React will overwrite, removing a node React thinks it owns. Refs are for
things React has no opinion about.

## Exercise 1 — a DOM handle

Edit `ex1/solution.tsx`. `AutoFocusInput({ label })` renders a labelled input
and focuses it when it first appears.

```
uv run dojo test react 08_refs_dom ex1
```

## Exercise 2 — memory without renders

Edit `ex2/solution.tsx`. `ClickTracker({ onRender })` has two buttons:

- `Tap` — increments a count that **must not** cause a re-render;
- `Show total` — reveals the count in a live region reading `3 taps`, which
  **must** cause exactly one re-render.

The `onRender` probe is already wired up, as in lesson 03. Before `Show total`
is pressed, nothing with `role="status"` may exist.

```
uv run dojo test react 08_refs_dom ex2
```

## Exercise 3 — passing a ref through

Edit `ex3/solution.tsx`. `FancyInput({ label, ref })` renders a labelled input
and forwards the `ref` it was given to that input, so a parent holding the ref
can focus it.

```
uv run dojo test react 08_refs_dom ex3
```

## Challenge — an imperative handle

Edit `challenge/solution.tsx`. `Editor({ label, ref })` renders a labelled
`<textarea>` whose text is controlled state. A parent holding a ref to it must
get an object with exactly two methods:

- `focus()` — focuses the textarea;
- `clear()` — empties it.

Forwarding the ref to the textarea will not do, because `clear` has to change
React state and a DOM node cannot.

The gate renders **two** editors, one with a ref and one without, and checks
that clearing one does not touch the other.

Honest difficulty note: `useImperativeHandle` is new here, and the hints give
you its shape. The `useId` already in the stub is there because two instances
are on screen.

```
uv run dojo test react 08_refs_dom challenge
```

## Review — focus management

`review1/solution.tsx`. `FocusOnOpen` renders a button reading `Open`. Clicking
it shows a `role="dialog"` containing a `Close` button, and **focus moves to
that Close button**. Clicking Close removes the dialog and **returns focus to
the Open button**.

This is the single most-skipped piece of dialog behaviour in real applications,
and it is the difference between a modal a keyboard user can use and one that
strands them.

```
uv run dojo test react 08_refs_dom review1
```

## The gate

This is the entire gate, `gate.test.tsx`:

<!-- GATE:BEGIN -->

```tsx
// Gate for react/08_refs_dom. Quoted verbatim in README.md.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef } from "react";
import { describe, expect, test, vi } from "vitest";

import { AutoFocusInput } from "./ex1/solution";
import { ClickTracker } from "./ex2/solution";
import { FancyInput } from "./ex3/solution";
import { Editor, type EditorHandle } from "./challenge/solution";
import { FocusOnOpen } from "./review1/solution";

describe("08_refs_dom", () => {
  test("ex1 - AutoFocusInput takes focus as soon as it appears", () => {
    render(<AutoFocusInput label="Email" />);

    expect(
      screen.getByLabelText("Email"),
      "the field is on screen but nothing is focused, so a keyboard user has " +
        "to tab to it. Point a ref at the input and call .focus() from an " +
        "effect, once the DOM exists (README ex1)",
    ).toHaveFocus();
  });

  test("ex2 - ClickTracker remembers without re-rendering", async () => {
    const user = userEvent.setup();
    const onRender = vi.fn();
    render(<ClickTracker onRender={onRender} />);

    const before = onRender.mock.calls.length;
    const tap = screen.getByRole("button", { name: "Tap" });
    await user.click(tap);
    await user.click(tap);
    await user.click(tap);

    expect(
      onRender.mock.calls.length - before,
      "counting the taps must not re-render anything - nothing on screen has " +
        "changed yet. Writing to a ref does not schedule a render, which is " +
        "the entire reason to use one here (README ex2)",
    ).toBe(0);
    expect(
      screen.queryByRole("status"),
      "and the total stays hidden until it is asked for",
    ).toBeNull();

    await user.click(screen.getByRole("button", { name: "Show total" }));
    expect(
      screen.queryByRole("status"),
      "revealing the total does need a render, so that part is state - expect: 3 taps",
    ).toHaveTextContent("3 taps");
    expect(
      onRender.mock.calls.length - before,
      "exactly one render, caused by the reveal",
    ).toBe(1);
  }, 20000);

  test("ex3 - FancyInput lets its parent reach the real input", async () => {
    const user = userEvent.setup();

    function Harness() {
      const field = useRef<HTMLInputElement>(null);
      return (
        <>
          <FancyInput ref={field} label="Search" />
          <button type="button" onClick={() => field.current?.focus()}>
            Focus the field
          </button>
        </>
      );
    }

    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Focus the field" }));

    expect(
      screen.getByLabelText("Search"),
      "the parent's ref never reached the <input>, so field.current was null " +
        "and the click did nothing. A component that wraps a form control " +
        "should pass a ref through to it",
    ).toHaveFocus();
  }, 20000);

  test("challenge - Editor exposes exactly two operations and no more", async () => {
    const user = userEvent.setup();

    function Harness() {
      const editor = useRef<EditorHandle>(null);
      return (
        <>
          <Editor label="Notes" />
          <Editor ref={editor} label="Draft" />
          <button type="button" onClick={() => editor.current?.clear()}>
            Clear the draft
          </button>
          <button type="button" onClick={() => editor.current?.focus()}>
            Focus the draft
          </button>
        </>
      );
    }

    render(<Harness />);
    const draft = screen.getByLabelText("Draft");
    await user.type(draft, "hello");
    expect(draft, "typing works normally").toHaveValue("hello");

    await user.click(screen.getByRole("button", { name: "Clear the draft" }));
    expect(
      screen.getByLabelText("Draft"),
      "clear() has to empty this editor. The handle the parent holds is not " +
        "the DOM node - it is the object you chose to expose (README challenge)",
    ).toHaveValue("");
    expect(
      screen.getByLabelText("Notes"),
      "and it must only affect the editor the ref points at",
    ).toHaveValue("");

    await user.click(screen.getByRole("button", { name: "Focus the draft" }));
    expect(screen.getByLabelText("Draft"), "focus() has to focus it").toHaveFocus();
  }, 30000);

  test("review1 - FocusOnOpen moves focus in and hands it back", async () => {
    const user = userEvent.setup();
    render(<FocusOnOpen />);

    const open = screen.getByRole("button", { name: "Open" });
    await user.click(open);

    const close = screen.getByRole("button", { name: "Close" });
    expect(
      close,
      "when a dialog opens, focus has to move into it - otherwise a keyboard " +
        "user is still standing outside a dialog they cannot see",
    ).toHaveFocus();

    await user.click(close);
    expect(
      screen.queryByRole("dialog"),
      "closing removes the dialog",
    ).toBeNull();
    expect(
      screen.getByRole("button", { name: "Open" }),
      "and focus goes back where it came from. Without this, focus falls to " +
        "the top of the document and the user loses their place entirely",
    ).toHaveFocus();
  }, 20000);
});
```

<!-- GATE:END -->

In plain English:

- **ex1** simply asks whether the input has focus after rendering.
  `toHaveFocus()` compares against `document.activeElement`.
- **ex2** counts renders around three taps and requires the difference to be
  zero, checks nothing is revealed yet, then reveals and requires exactly one
  more render and the right total.
- **ex3** defines a little `Harness` component inside the test that creates a
  ref, hands it to your component, and has a button that calls
  `ref.current?.focus()`. If your component drops the ref, `current` is `null`
  and the click does nothing.
- **challenge** renders two editors, types into one, clears it through the
  handle, checks both, then focuses through the handle. The type
  `EditorHandle` is imported from your file, so the shape you expose is part
  of the contract.
- **review1** clicks Open and asserts focus landed on Close, then clicks Close
  and asserts the dialog is gone and focus is back on Open.

## The teaching point

Refs are the escape hatch, and the useful discipline is to notice when you are
using them as one. Reaching for a ref to focus something, measure something or
integrate a chart library is the tool working as intended. Reaching for a ref
because a piece of state was "causing too many re-renders" is usually a sign the
state was in the wrong place — and the ref version will be quietly wrong later,
because a value nobody renders from can drift out of sync with what is on
screen.

The focus work in the review exercise is worth more than it looks. Focus is the
keyboard user's cursor: if you show them something and do not move focus to it,
they do not know it exists; if you remove the thing they were standing on and do
not put them somewhere sensible, the browser drops them at the top of the
document. Every dialog, drawer, menu and toast has this obligation, and almost
none of them meet it.

Next: **09_context_reducer**, where state stops belonging to one component.
