## Hint 1

The subscription is opened once, and the function handed to it was created
during the first render — so `alerts` inside it is `[]` and `muted` is `false`,
for ever. Every alert rebuilds the list from that empty array.

## Hint 2

Adding the three values to the dependency array would fix the staleness by
reopening the connection every time anything changes, which the gate forbids.
What you want is a handler that does not need to remember anything: one that
describes what happened and lets something else, holding the current state,
decide what that means.

## Hint 3

`dispatch` from `useReducer` is guaranteed stable, so an effect that depends on
it never re-runs. Put all three values in one reducer state — whether an alert
is listed or counted is a decision about the mute, and a reducer is where a
decision like that belongs.
