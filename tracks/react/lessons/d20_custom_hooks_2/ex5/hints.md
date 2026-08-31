## Hint 1

The initialiser passed to `useState` runs once, on the first render, and never
again — which is exactly right for the value and exactly wrong for a key that
can change underneath it.

## Hint 2

Store the key alongside the value, so the hook can compare the key its state
was built for against the key it has been given this render. When they differ,
the state is stale and has to be replaced.

## Hint 3

Do that replacement **during render**, not in an effect: set the new state and
use the new value in the same pass. React notices a component setting its own
state while rendering, throws that render away and runs it again — so nothing
is ever committed showing one key's value under another's name.
