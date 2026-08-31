## Hint 1
A `<select>` and a `<textarea>` are controlled the same way a text box is: they
render `value` and report `event.target.value`. The difference is only in the
markup - React gives a textarea a `value` prop rather than children.

## Hint 2
Two details decide this one. The submit handler receives the event and owes it
`preventDefault()`, or the browser posts the form and reloads the page. And a
form is only findable by role once it has an accessible name, which for a form
with no visible heading means `aria-label`.
