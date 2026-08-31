## Hint 1

The stub already tracks which entry is active and already moves the tabindex
around. What it never does is tell the browser. Focus is a property of the
document, not of your state, and only a `.focus()` call changes it.

## Hint 2

Collect the button nodes as they mount — a callback ref writing into
`items.current[index]` — and add an effect that focuses `items.current[active]`
whenever `active` changes. Note that such an effect also covers the very first
render, so the mount-only effect in the stub can go.

## Hint 3

Home and End are missing entirely, and every arrow key you handle should call
`event.preventDefault()` so the page does not scroll underneath the menu. The
wrap-around at both ends is arithmetic you should write out rather than guess.
