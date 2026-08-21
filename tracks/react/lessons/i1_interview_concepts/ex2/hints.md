## Hint 1
Everything in this component is correct except one expression, and React logs no
warning — a key is present. Run the gate, read where the typed text ended up,
and describe the mechanism before you change anything. Interviewers score the
explanation, not the edit.

## Hint 2
The sort moves Zebra from position 0 to position 2, but with `key={index}` the
row at position 0 is key `0` before and after. React concludes it is the same
row that merely changed its label, so it updates the text and the `id` and
**keeps the existing DOM node** — including the value the browser is storing
inside the uncontrolled `<input>`.

## Hint 3
A key has to identify the item, not its position: stable, unique among
siblings, and derived from the data. These items already carry exactly such a
field. The follow-up worth having an answer to before you move on: when the data
genuinely has no id, where should one come from — and why not `Math.random()`?
