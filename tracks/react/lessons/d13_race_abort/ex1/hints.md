## Hint 1

Two requests are in flight and both will call their `.then` — there is no way
to stop that. The question is not how to cancel a promise; it is how the
callback can tell that nobody wants its answer any more.

## Hint 2

The effect already returns nothing. Give it a cleanup, and give it something
for that cleanup to change: a plain `let` declared **inside the effect body**,
which the callback reads before it touches state. One variable per run of the
effect is the whole trick.
