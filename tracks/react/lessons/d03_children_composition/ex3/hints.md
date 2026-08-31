## Hint 1
One prop chooses between two live-region roles. Everything else about the
component - what it wraps and how - is the same in both cases.

## Hint 2
`role="alert"` interrupts whatever the screen reader is saying; `role="status"`
waits politely. Compute the role in the JSX from the tone rather than writing
two nearly identical returns.
