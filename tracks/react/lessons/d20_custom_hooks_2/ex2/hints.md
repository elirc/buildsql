## Hint 1

`subscribe` returns something, and the stub throws it away. Look at what it
returns and at what an effect is allowed to return, and notice that they are
the same shape.

## Hint 2

React runs the previous cleanup before the next effect and once more on the way
out, so returning the unsubscribe function covers both cases the gate checks:
swapping the source, and unmounting. Note that `setValue` from `useState` is
stable, which is why it does not belong in the dependency array.
