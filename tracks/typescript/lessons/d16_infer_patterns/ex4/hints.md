## Hint 1

A tuple type may have its rest element anywhere, not only at the end:
`[...unknown[], infer Last]` is a legal pattern and means what it looks like.

## Hint 2

The leading rest absorbs any number of elements, including none, so a
one-element tuple still matches - and an empty tuple does not, because there is
no final element to bind.

Left to you: whether `unknown[]` or `never[]` belongs in the leading rest. Only
one of them accepts every tuple you might be handed.
