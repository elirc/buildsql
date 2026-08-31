## Hint 1

This is the shortest of the eight, and the temptation is to make it longer.
Ask what state a race actually needs: a counter? no. A flag for "already
settled"? Think about what a promise does when you resolve it twice.

## Hint 2

Attach `resolve` and `reject` to every input and stop. The first settlement
wins because a promise can only settle once and silently ignores the rest —
the same rule you relied on in ex1's rejection path.

The empty case needs no special handling either: nothing is attached, so
nothing ever settles it. That is exactly what the specification says
`Promise.race([])` does, and it is worth being able to explain why rather than
treating it as a quirk — there is no first settlement, so there is nothing to
report.

Be ready for the follow-up: why is `race` the wrong tool for failover? Because
a task that fails in 5ms beats one that succeeds in 50ms, and you will have
built something that reliably returns the fastest error. That is ex3.
