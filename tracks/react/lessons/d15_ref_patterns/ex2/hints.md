## Hint 1

The dependency array is already right: the effect runs when the slot changes,
which is when a new impression *might* have happened. What it cannot tell you
is whether this particular slot has been reported before, because a dependency
array only compares against the previous run, not against every run.

## Hint 2

The component needs a memory of every slot it has already reported. Nothing on
screen depends on that memory, so it must not be state — putting it in state
would also put it in the array and start a loop. A `Set` living in a ref is
the whole answer.
