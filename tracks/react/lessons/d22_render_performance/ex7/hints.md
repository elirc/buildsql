## Hint 1

Two pieces of state, and neither of them is read by either panel. Every
keystroke and every tick re-renders the shell, and the shell renders the
panels, so they go along for the ride.

## Hint 2

Do exercise 2's move twice. The counter and its button belong together in one
component; the input and the text it echoes belong together in another. What is
left in the shell is markup with no state.

## Hint 3

Once the shell has no state, it has no reason to render again at all — which is
a stronger guarantee than wrapping the panels in `memo`, because there is
nothing for a future prop to accidentally break.
