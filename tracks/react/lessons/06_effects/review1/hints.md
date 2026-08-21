## Hint 1
One effect, one cleanup, and a dependency array. The announcement happens in
the effect body; the retraction happens in the cleanup it returns. Both are
handed the message they are about.

## Hint 2
The interesting question is *which* message the cleanup should pass. Look at
the gate: when the message changes from `Saved` to `Deleted`, it expects
`onClear("Saved")` — the old one. You do not have to arrange that; it falls out
of how closures work, as long as the cleanup reads the same `message` variable
its own effect run did.

## Hint 3
React's order on an update is: run the previous cleanup, then run the new
effect. Each effect run and its cleanup belong to the same render and therefore
see the same props. The last decision is the dependency array — list everything
the effect and its cleanup read between them.
