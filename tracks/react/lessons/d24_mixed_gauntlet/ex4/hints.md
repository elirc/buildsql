## Hint 1

The context part already works: the pane takes no id as a prop and asks the
session for it. What is missing is what happens when the session changes while
a request for the old one is still out.

## Hint 2

Two requests, and the first one answers last. The effect that started it is
long retired, but its `.then` closure is not — promises have no cancel button,
so the callback has to be able to tell that nobody wants its answer.

## Hint 3

A `let` declared inside the effect body, flipped by the cleanup, checked before
`setProfile`. One flag per run, which is why it cannot be a ref: a ref would be
one flag shared by every session this component ever shows.
