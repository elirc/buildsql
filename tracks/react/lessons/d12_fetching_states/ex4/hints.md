## Hint 1
Two problems. The button currently does nothing, and even once it does
something there is no way for the component to know that a request is in
flight - which is the fact the disabled attribute needs.

## Hint 2
An effect re-runs when one of its dependencies changes, so a counter in state
that the button increments is a perfectly good "please run again" signal. Keep
a separate `loading` boolean: it goes true when a request starts and false when
it settles.

## Hint 3
Notice what the gate asserts while the refresh is in flight: the number that is
already on screen has to stay there. That rules out clearing the level when the
new request starts - the only thing that changes at that moment is `loading`.
