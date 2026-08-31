## Hint 1

Every branch of the stub writes to `state` and hands the same object back.
React decides whether anything changed by comparing the old state with the new
one by reference, so a mutated object is a change React cannot see.

## Hint 2

Build a new object with the step you want — and clamp it, because there is no
step below the first or above `total - 1`. All three actions are the same
operation with a different target, so one small helper covers them.

## Hint 3

Read the gate's `toBe` assertions carefully: when the clamp means the step does
not move, the right answer is not a fresh copy that happens to be equal, it is
the very object you were handed.
