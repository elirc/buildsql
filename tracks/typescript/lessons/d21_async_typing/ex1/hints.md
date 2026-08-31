## Hint 1

`Promise<R[]>` is one promise of many results. `Promise<R>[]` is many promises
and is what `values.map(fn)` gives you - the difference is the whole exercise.

## Hint 2

Sequential means the `await` has to be inside the loop. `values.map(fn)` starts
every call immediately, and `await Promise.all(...)` on the result keeps the
order but not the sequencing - the gate logs the starts and ends to tell the two
apart.

Left to you: a `for` loop with an index, or `for...of` with `entries()`. Both
give you the index; only one of them needs a cast under stricter index settings.
