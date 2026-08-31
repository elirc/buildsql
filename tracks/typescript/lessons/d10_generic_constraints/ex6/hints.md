## Hint 1

Two type parameters that are unrelated: `T` is what is in the list, `G` is what
the callback returns. Only `G` is constrained, and only because it has to be
usable as a key.

Return `Map<G, T[]>`.

## Hint 2

Ask the map for the bucket once. If it is missing, `set` a new one-element
array; otherwise push. That single lookup is also what gives you first-seen
group order for free.

Do not stringify the key - `Map` takes any key type, which is exactly why the
constraint can stay as wide as `string | number`.

Left to you: `groups.get(key) ?? []` followed by an unconditional `set`, or the
branch above. One of them writes to the map on every item.
