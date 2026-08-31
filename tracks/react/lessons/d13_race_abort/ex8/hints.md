## Hint 1

The stub's guard is not wrong, it is wasteful: it throws away a true answer
because the user moved on, and then pays for that answer again. Ask what the
state should be. `value` means "the answer", singular — which is why a second
answer has nowhere to live.

## Hint 2

Store the answers keyed by the metric they answer, and render the key that is
selected. Once you do, a late answer cannot be shown by accident, because
showing it would mean the user is on that tab — and the race is gone rather
than guarded.

## Hint 3

The other half is not asking twice. Keeping "which metrics have been requested"
in state would put it in the effect's dependencies and start a loop; it never
needs to be rendered, so it does not need to be state.
