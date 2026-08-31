## Hint 1

Every part renders the right element and the card still has no accessible name.
An `<article>` gets one from `aria-labelledby` pointing at an element's id — and
the element that holds its name is written by the caller, inside it.

## Hint 2

So an id has to travel down from the card to the title, and the reference back
up. `useId` in the card, a context to carry it, and the title puts it on its
heading. The caller writes exactly the same JSX either way.

## Hint 3

The gate puts two cards on one page, which is why the id must come from `useId`
rather than a constant: two identical ids make both `aria-labelledby`
references point at the same heading.
