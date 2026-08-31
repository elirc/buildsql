## Hint 1
Two pieces of state that must not be confused: the list of committed tags, and
the draft text in the box. Every rule in the prompt is about moving text from
the second into the first, or about refusing to.

## Hint 2
Both key rules live in `onKeyDown`, because `onChange` never sees Enter or
Backspace. Enter also needs `preventDefault()` - inside a real form it would
otherwise submit the whole thing while the user was still adding tags.

## Hint 3
Backspace must only remove a chip when the draft is empty, or you delete
someone-s work while they are mid-word. For the duplicate case, decide what
should happen to the text still sitting in the box - the gate says it stays,
and that is a deliberate product decision, not an accident.
