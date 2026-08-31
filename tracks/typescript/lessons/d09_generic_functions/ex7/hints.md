## Hint 1

Return `T[]`, and note the comparator's contract: negative when the first
argument sorts first, zero when they tie, positive otherwise. That is the same
contract `Array.prototype.sort` uses.

## Hint 2

Two indices, one `while` that runs until either list is exhausted, then two
short loops to drain whichever list is left.

The tie is the exercise: `compare(a[i], b[j]) <= 0` takes from the first list
when they are equal, which is what makes the merge stable. Using `<` reverses
equal elements, and the gate merges two lists of tagged objects to catch it.

Left to you: `concat`enating the remainder instead of draining it in a loop.
Both are correct - one of them allocates, and neither is worth arguing about.
