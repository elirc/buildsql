## Hint 1

Narrow `Light` to the three lamps. That also changes what `Record<Light, Light>`
means: with a literal union as the key type it is an exhaustive table, and
leaving a lamp out becomes a compile error.

## Hint 2

`-1 % 3` is `-1` in JavaScript, not `2` - so a bare remainder gives you a
negative number of steps and, if you index an array with it, `undefined`.

The idiom is `((steps % period) + period) % period`, which lands in range for
negatives and positives alike. After that, walking the table forward that many
times is enough; the backwards direction never needs its own code.

Left to you: walking the table, or building an ordered array and indexing it.
The table version keeps one description of the cycle - say why that matters.
