## Hint 1

Fix the return type to say what the function really produces: an array of
strings and an array of numbers. That is the payoff of narrowing - the caller
never has to ask again.

## Hint 2

Declare both accumulators with their narrow types, walk the input once, and let
the `typeof` guard choose which one to push into. The `else` branch is narrowed
to `number` without you saying anything.

Both arrays are declared before the loop, so an empty input returns two empty
arrays with no special case.

Left to you: `if`/`else`, or two `filter` calls with casts. One of those two
still compiles after someone adds `boolean` to the input union, and is wrong
when they do.
