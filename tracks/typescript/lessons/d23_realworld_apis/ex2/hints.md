## Hint 1

The guard is what makes `T` appear: `(value: unknown) => value is T` is the only
place `T` occurs in the parameters, so the caller supplying `isUser` decides the
success type.

## Hint 2

Two checks in order: the status range first, then the guard. Reversing them
would report a 404 with an empty body as a shape problem, which sends whoever
reads the log to the wrong place.

Left to you: whether to include the body in the shape failure. The prompt does
not; think about what you would want in the log at three in the morning.
