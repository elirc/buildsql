## Hint 1
The email box is already controlled; the checkbox is not. Give the checkbox
state of its own, remembering that a checkbox is driven by `checked` and
reports through `event.target.checked`.

## Hint 2
Whether the button is enabled is not a third piece of state — it is a fact
about the other two, so compute it during render:

```tsx
const ready = /* … */;
…
<button type="submit" disabled={!ready}>
```

Storing `ready` in state would give you two sources of truth that have to be
kept in step by hand, and they eventually will not be.

## Hint 3
"Filled in" should mean more than "not empty string" — a space is not an email
address, so `trim()` before you decide. What counts as a valid address beyond
that is a judgement call: the gate only requires the button to unlock, but ask
yourself whether a disabled button or an error message is kinder to somebody
who cannot work out why nothing happens.
