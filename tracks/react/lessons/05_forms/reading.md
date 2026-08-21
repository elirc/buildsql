# Reading — react/05_forms

## Notes

**Controlled vs uncontrolled, precisely.** A controlled component renders its
value from React state and reports changes upward; React is the source of
truth. An uncontrolled component lets the DOM keep the value — you seed it with
`defaultValue`/`defaultChecked` and read it later, usually through a ref or by
reading the submitted `FormData`. Neither is deprecated. Controlled is the
default because it makes the value available *while* the user is typing, which
is what live validation, character counters, dependent fields and disabled
submit buttons all need. Uncontrolled is genuinely better for large forms where
per-keystroke re-rendering is wasteful, and for integrating a non-React widget.

**React's `onChange` is not the DOM's `change`.** The DOM fires `change` on
blur for text inputs; React's `onChange` is wired to the `input` event and
fires on every keystroke. That difference trips people coming from plain
JavaScript, and it is why controlled inputs feel live without any extra work.

**Every input needs a label, and `placeholder` is not one.** A placeholder
disappears the moment the user types, fails contrast guidelines in most
implementations, and is not reliably announced. `<label htmlFor>` or a wrapping
`<label>` gives the control an accessible name permanently — which is also why
`getByLabelText` is the first query you should reach for in a form test.

**Submit belongs on the form.** Handling submission on the button's `onClick`
breaks pressing Enter inside a field, breaks screen-reader submit affordances,
and misses submissions triggered any other way. `<form onSubmit>` plus
`<button type="submit">` covers all of them — and note `type="submit"` is the
default for a button inside a form, which is why a stray `<button>Cancel</button>`
submits the form. Always be explicit.

**Validation happens at least twice.** Client-side validation is a courtesy to
the user and nothing more; it can be bypassed by anybody with a devtools
window, so the server validates again. The client's job is to be fast, specific
and kind: say which field, say what is wrong, say what "right" looks like, and
do not clear what the user typed.

## ex1 — the loop, seen from the inside

The most useful thing to take from this exercise is what the keystroke actually
does. It does *not* change the input. The sequence is: browser fires `input`,
React calls your `onChange`, you call `setName`, React re-renders, React sets
the DOM node's `value` property from your state. Every character on screen came
from React, which is why transforming the value in the handler changes what is
displayed, and why an `onChange` that forgets to call the setter produces a box
you cannot type in at all.

That also explains the React warning "You provided a `value` prop to a form
field without an `onChange` handler." React is telling you that you have made
the field read-only by accident. The fixes are to add the handler, or — if you
meant it — to add `readOnly`.

One subtlety about the uppercase transform: because the state is uppercased,
the cursor stays put and everything behaves. Transforms that *change the length*
of the string — inserting spaces into a card number, stripping characters — move
the caret to the end on every keystroke, and fixing that requires manual
selection handling. It is a well-known rough edge worth knowing exists before
you promise a formatted input to a designer.

## ex2 — the three control shapes

Selects and text inputs are the same story: `value` in, `event.target.value`
out. The checkbox is the exception that generates bugs — its `value` attribute
is for form submission (`"on"` by default) and its state is `checked`. A
component written with `value={agreed}` on a checkbox silently does nothing
useful, and it looks right.

React's handling of `<select>` is worth one more sentence because it comes up in
interviews. In HTML the selected option is marked on the `<option>`; React
moves it to the `<select>`'s `value` prop, so that the control has one place
that decides. Multi-select works the same way with an array. Radio groups are
the remaining shape: several inputs sharing a `name`, each with its own `value`,
each `checked` when the state equals its value.

## ex3 — one handler, and the spread that keeps the rest

Two techniques combine here, and both are worth having by reflex. The first is
using the `name` attribute as the bridge from DOM to state, which is what lets
a single handler serve any number of fields — and, incidentally, is exactly how
`FormData` names things when you submit uncontrolled forms, so the naming stays
useful either way.

The second is `{ ...previous, [name]: value }`. The broken stub replaces the
object, which deletes every key it did not mention; React does not merge state
objects for you (class components' `setState` did, which is a genuine source of
confusion for people who learned React before hooks). The computed-key syntax
`[name]:` is plain JavaScript and is what makes the update generic.

Using the updater form here is not decoration either. Two changes landing in
the same batch — which happens with autofill, paste handlers, or programmatic
updates — would both spread the *same* stale `form` and one would be lost.

The remaining design question, which has no single right answer: one object or
one `useState` per field? Split state by what changes together. Fields that are
submitted as a unit and validated as a unit belong together; a field that
drives an unrelated piece of UI does not.

## ex4 — validating without lying to the user

The structural move is to keep validation as a **pure function** of the values,
separate from the component. It becomes readable, unit-testable, and reusable
on the server; and the component's job shrinks to "run it, store the result,
decide whether to submit".

`preventDefault()` is not optional. A form's default action is a navigation,
which in a single-page app unmounts everything and loses all state — and in a
test environment produces a confusing "not implemented" message from jsdom.
Calling it first, before any branching, is the habit that never bites.

`role="alert"` on the error region matters because of *when* the user finds
out. Without a live region, a sighted user sees red text appear and a
screen-reader user hears nothing at all — they pressed the button and, as far
as they can tell, nothing happened. `alert` interrupts and reads the new
content. The other half of a really good implementation, which the gate does
not require but real forms should do, is moving focus to the first invalid
field or to the summary.

Note also what the gate checks about the *absence* of the alert. An error region
that is always in the DOM and merely empty is announced as an empty region and
gives assistive technology nothing to work with; rendering it conditionally
means its appearance is itself the signal.

## challenge — errors that know which field they belong to

The shape of the state is the exercise. An array of messages cannot answer
"which field is broken", so every attempt to wire it per-field turns into
string matching. An object keyed by field name answers it directly, and it also
makes "is the form valid" a one-liner (`Object.keys(errors).length === 0`).

`aria-invalid` and `aria-describedby` are the two attributes that make an error
message real for somebody using a screen reader. Without `describedby`, the
message is a floating piece of text with no relationship to the field —
perfectly visible on screen, completely disconnected in the accessibility tree.
With it, tabbing into the field announces "Postcode, edit text, invalid entry,
Postcode must be four digits".

The gate insists on `aria-invalid="false"` rather than an absent attribute for
valid fields, which is a slightly stricter rule than the spec requires; the
reason is that it lets a test — and a screen reader — distinguish "checked and
fine" from "not checked yet". In production either is acceptable; being able to
explain the difference is the point.

The design question the exercise deliberately leaves open is *when* to
validate. Validating on every keystroke tells people their email is invalid
while they are still typing it, which is hostile. The usual answer is: validate
a field on blur once it has been touched, validate everything on submit, and
after a failed submit switch to validating as they type so the error clears as
soon as it is fixed.

## review1 — derived enablement

`disabled={!ready}` where `ready` is computed during render is the small,
important habit: the button's state is not a fact to be stored, it is a
consequence of two facts already stored. Every extra piece of state is another
thing that can disagree with reality — set `ready` in one handler and forget it
in another and you have a form that never unlocks.

`trim()` before deciding is the kind of detail that separates a demo from a
product: a field containing three spaces is not filled in. And the broader
question the hint raises is a real UX debate. A disabled submit button is easy
to implement and leaves users who cannot work out what is missing with nowhere
to go; the increasingly common alternative is to keep the button enabled and
explain on submit. Either is defensible if you chose it.

## Further reading

- [react.dev — `<input>`](https://react.dev/reference/react-dom/components/input) — the controlled/uncontrolled contract, plus every gotcha React has documented.
- [react.dev — `<select>`](https://react.dev/reference/react-dom/components/select) and [`<form>`](https://react.dev/reference/react-dom/components/form) — why `value` moved to the select, and what React 19 added to forms.
- [react.dev — Updating Objects in State](https://react.dev/learn/updating-objects-in-state) — the spread pattern from ex3, including nested objects.
- [MDN — Client-side form validation](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation) — the native constraint API you are deliberately not using here, and when to use it.
- [MDN — `aria-invalid`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-invalid) and [`aria-describedby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-describedby) — the two attributes from the challenge.
- [Testing Library — `getByLabelText`](https://testing-library.com/docs/queries/bylabeltext/) — why it is the first query to reach for in a form.
