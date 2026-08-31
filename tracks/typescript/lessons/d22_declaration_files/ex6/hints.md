## Hint 1

A namespace merges with an enum of the same name, exactly as it merges with a
function - and, as with a function, the enum has to be declared first.

## Hint 2

For `parse`, look the name up on the enum object itself. The object is indexed
by both the member names and their numeric values, so the result may be a
number, a string, or `undefined` - and only the number is a level.

Left to you: whether to index the enum object or to hand-write a lookup table.
The first stays correct when a member is added; the second is the one that does
not need a cast.
