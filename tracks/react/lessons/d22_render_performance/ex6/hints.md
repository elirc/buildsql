## Hint 1

Count the renders on mount: one showing `No session`, then the effect runs, sets
state, and a second one shows the token. The user sees the empty state flash
past, and nothing about reading the token needed to wait.

## Hint 2

An effect is for synchronising with something outside React *after* the screen
has been painted. Reading a value you already have is not that. `useState`
accepts a **function** as its initial state and calls it once, before the first
render — note that you pass the function itself rather than calling it.

## Hint 3

Once the token can never be missing, the `null` branch of the render has
nothing to describe, and it can go too. A state that cannot hold a value is
simpler than one that can.
