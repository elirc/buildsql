## Hint 1

Two requirements pull against each other. Keeping `onMessage` in the
dependency array reopens the connection every time the parent renders; taking
it out leaves the subscription calling the first render's function for ever.
Neither array is the answer, so the answer is not an array.

## Hint 2

Put the newest callback somewhere that changing does not count as a change: a
ref, updated by its own tiny effect with no dependency array. The subscription
then reads `ref.current` at the moment a message arrives, which is always the
current one.

## Hint 3

Only `subscribe` is left in the dependency array of the effect that opens the
connection — and check what your cleanup returns, because the source already
hands you the function that closes it.
