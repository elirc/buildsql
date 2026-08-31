## Hint 1

The return type is `T & D` - every member of both. Two independent type
parameters, each with its own constraint.

## Hint 2

One spread expression does the work, and the order is the behaviour: defaults
first, so the value spread over the top wins.

TypeScript will not verify that the result is a `T & D` when keys overlap, so
one `as T & D` on the way out is expected. Say why it is safe rather than hiding
it.

Left to you: whether a `value` member explicitly set to `undefined` should be
allowed to erase a default. A spread says yes - decide whether you agree.
