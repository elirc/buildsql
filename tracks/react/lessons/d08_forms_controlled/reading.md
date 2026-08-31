# Reading — react/d08_forms_controlled

## Notes

One sentence unites all eight problems: **the input does not hold the value, the
component does.** Everything else follows. If the state is the truth, then a
keystroke you refuse to store never happened; a field you forget to spread is a
field you deleted; a value the user is halfway through typing has to be
representable, which is why `""` is a legal quantity and `null` is not the same
as `0`. The set also drills the shape of the surrounding markup — a group of
radios is one question and needs to say so, a form needs a name to be findable,
a live region is how a change gets announced — because a form that works with a
mouse and vanishes for a screen reader is half a form.

## ex1

Tests whether you understand that a controlled input is a render of state, so
rejecting a change is simply not calling the setter: React re-renders the box
with the value it already had and the keystroke disappears. The classic mistake
is `defaultValue`, which makes the input uncontrolled — the state then trails
behind the DOM and every rule you write is advisory. The model answer validates
the proposed value first and returns early, which is the same shape every masked
or capped field in the set uses.

## ex2

Tests the difference between three radios and one question. The classic mistake
is omitting the shared `name` attribute, which leaves you with three
independently checkable controls that happen to look like radios, and omitting
`role="radiogroup"`, which leaves a screen-reader user with three unrelated
options and no idea they belong together. The model answer keeps one `chosen`
string in state, starts it at `""` to mean nothing is chosen, and lets each radio
compare itself to it.

## ex3

Tests that selects and textareas are controlled exactly like text boxes, and
that a submit handler owes the event a `preventDefault()`. The classic mistake is
forgetting it: in a browser the page reloads and the state is gone, and in a test
you get a silent pass because jsdom does not navigate. The second is expecting
`getByRole("form")` to work on an unnamed form — the form role only exists once
the element has an accessible name. The model answer names the form and prevents
the default in one handler.

## ex4

Tests the spread. Three fields in one object with one handler is the shape every
real form has, and the handler learns which key to write from the input's `name`,
so adding a fourth field is markup only. The classic mistake is
`setAddress({ [name]: value })`, which does not update the address — it replaces
it, silently emptying the two fields the user filled in first. The model answer
copies the previous object before overriding one key, and routes both the edit
and the reset through one `update` function so the callback can never be
forgotten.

## ex5

Tests whether you can tell the value from its representation. A quantity box has
a state a number cannot express: empty, mid-edit, on the way from 1 to 12. The
classic mistake is `useState(1)` plus `Number(event.target.value)`, which turns
an empty box into `0`, a deleted digit into a jump, and a stray letter into
`NaN`. The model answer keeps the text, reports `null` for empty, and does the
clamping on blur — because clamping during typing rewrites what the user is
still saying.

## ex6

Tests derived state. The city list is a function of the chosen country and
belongs in the render body, not in a second `useState` that some effect has to
keep in step. The classic mistake is exactly that copy, and its twin: leaving the
previously chosen city in place when the country changes, which submits a pair
like Geelong, Japan. The model answer computes `cities` during render and clears
the city in the country handler, so the two states can never disagree.

## ex7

Tests keyboard handling and array updates together, which is why it is an
interview favourite. Three details separate a working tags input from a good one:
`Enter` needs `preventDefault()` or it submits the form the widget is sitting in;
`Backspace` may only eat a chip when the draft is empty; and a refused duplicate
must say why rather than doing nothing. The classic mistake is committing on
`onChange` instead of `onKeyDown` — `onChange` never sees Enter. The model answer
keeps committed tags and the draft as separate state and funnels every mutation
through one `commit` so the callback and the message stay in step.

## ex8

Tests the masked-input pattern: the state is the digits, the displayed value is
derived from them, and the parent gets the plain number. The classic mistake is
storing the formatted string, which means the next keystroke has to be parsed
back out of a value your own formatter produced — commas and all. The second is
`Number("")`, which is `0`: an empty box then reports a price the user never
typed, and the difference between `0` and `null` is a real bug in real checkouts.
The model answer strips to digits on the way in and groups on the way out.

## Further reading

- [Reacting to input with state](https://react.dev/learn/reacting-to-input-with-state)
- [`<input>` — React reference](https://react.dev/reference/react-dom/components/input)
- [`<select>` — React reference](https://react.dev/reference/react-dom/components/select)
- [Choosing the state structure](https://react.dev/learn/choosing-the-state-structure)
- [MDN: `<input type="radio">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio)
- [MDN: ARIA live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)
