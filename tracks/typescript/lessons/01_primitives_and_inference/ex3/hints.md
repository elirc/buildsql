## Hint 1

Two separate mistakes are being tested here, and it is worth naming them
apart. The first is a runtime one that every JavaScript developer meets once:
`Array.prototype.sort` sorts *in place* and compares *as strings* unless you
tell it otherwise. The second is a type one: the gate passes a value the
current parameter type refuses.

Run the gate and read both failures before touching anything.

## Hint 2

`[10, 9, 1].sort()` is `[1, 10, 9]`, because `"10" < "9"` as text. A comparator
fixes it: `sort` wants a function returning a negative number, zero, or a
positive number.

For the parameter: `readonly number[]` is the *wider* type - it accepts both
frozen and mutable arrays, because it promises less about what you will do
with them. `number[]` accepts only mutable ones. You want the wider one.

## Hint 3

Widen the parameter to `readonly number[]`, keep the return type as
`number[]`, and make a copy before sorting - `[...values]` or `values.slice()`
both give you a fresh, mutable array. Then sort the copy with a numeric
comparator.

The decision left to you: which of the two copy idioms you use, and whether
your comparator is `a - b` or an explicit pair of comparisons. They are not
equally readable, and they are not equally correct for every element type.
