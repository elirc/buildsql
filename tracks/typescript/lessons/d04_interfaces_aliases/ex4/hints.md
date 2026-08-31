## Hint 1

Give the index signature a real value type. It has to be one that `total: number`
also satisfies, or the declaration will not compile at all - which is the
constraint this exercise exists to show you.

## Hint 2

Iterating the object hands you `total` along with the openings, so skip it by
name. Seed the running best at `-1` rather than `0`, so that an opening recorded
zero times still beats "nothing recorded".

The tie-break is a second condition on the same `if`: equal counts, and the new
name sorts before the current one.

Left to you: a single pass with two accumulators, or `Object.entries(...).filter(...).sort(...)`.
The second reads well and allocates twice - say which you would ship.
