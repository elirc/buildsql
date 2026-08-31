## Hint 1

Where you declare the state is the whole exercise. It has to live in
`makeCounter`'s body - one `let` per call to the factory - so that the three
returned functions close over the same variable and two counters never share
one.

## Hint 2

`next()` returns the *current* value and then advances, so it needs a local
copy before the increment. `peek()` returns the same number without touching
it. `reset()` assigns the parameter back into the state - the parameter is part
of the closure too, so nothing extra needs storing.

Left to you: a defaulted parameter (`start: number = 0`) or an optional one
plus `??` in the body. One of them makes `reset()` a single line.
