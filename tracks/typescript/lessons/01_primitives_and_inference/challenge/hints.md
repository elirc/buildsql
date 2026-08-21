## Hint 1

Three cases decide this one, and only one of them is the interesting loop: a
size that makes no sense, an input that divides evenly, and an input whose
last chunk is short. Write down what each should produce before you write any
code - the gate checks all three.

## Hint 2

`Array.prototype.slice` on a `readonly number[]` gives you a fresh, mutable
`number[]`, and it clamps for you: `[1, 2, 3].slice(2, 4)` is `[3]`, not an
error. That is the whole reason the short final chunk needs no special case.

Step your loop index by `size` rather than by one.

## Hint 3

Guard the nonsense sizes first and return `[]` for them - the README says
which sizes count as nonsense, and `Number.isInteger` is how you say "not 1.5"
without a regex. Then loop `for (let i = 0; i < values.length; i += size)` and
push `values.slice(i, i + size)`.

The decision still yours: whether a fractional size like `2.5` is nonsense or
gets floored. Read the README prompt again - it is explicit, and the gate
agrees with it.
