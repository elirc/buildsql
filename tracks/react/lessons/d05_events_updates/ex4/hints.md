## Hint 1
A click on the Dismiss button is also a click on the card, because the event
travels outwards from the element it started on. Both handlers are on that
path, so both run.

## Hint 2
`event.stopPropagation()` ends the journey at the element that calls it. Note
what it does *not* do: it does not cancel the browser default, which is
`preventDefault` and a different question - be able to say which you need here
and why.
