## Hint 1

Step one is a distributive conditional whose true branch is `(arg: U) => void`.
That turns `A | B` into `((arg: A) => void) | ((arg: B) => void)`.

## Hint 2

Step two matches that union against a single `(arg: infer I) => void`. The
compiler has to find one parameter type that works for *every* member of the
union, and for parameters that means the intersection.

## Hint 3

Wrap step one in parentheses before the outer `extends`, or the two
conditionals will bind in the wrong order and the error will be about
something else entirely.

Left to you: whether to make the helper function type return `void` or
`unknown`. Try both; only one of them changes the answer, and the reason is
worth ten minutes.
