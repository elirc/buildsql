## Hint 1
Typing works, the counter updates, Save hands over the right string — so React
clearly knows what is in the box. And yet setting the state back to `""` leaves
the text on screen. Which of the two of them is actually deciding what the input
displays?

## Hint 2
`defaultValue` is read exactly once, when React creates the DOM node. From that
moment the browser owns the value, React never writes to it again, and the state
is a *copy* that happens to be kept in step by the change handler. Copies can be
updated independently, which is precisely what Reset did.

## Hint 3
The fix is a one-word rename that changes who is in charge: the input renders
the state on every render, so setting the state is the only way the box ever
changes. Be ready for the follow-up, because it is always asked — when *would*
you deliberately choose an uncontrolled input, and how would you read its value
on submit?
