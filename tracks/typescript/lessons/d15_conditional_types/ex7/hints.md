## Hint 1

Pick two literal types that are definitely not assignable to one another - say
`0` and `1`. `0 extends 1` is false, and it stays false no matter what.

## Hint 2

Now intersect one of them with `T`. For every ordinary `T`, `1 & T` is either
`1` or `never`, and `0` extends neither. For `any`, `1 & any` collapses to
`any`, and `0` extends `any`.

Note that the checked type is `0`, not `T`, so nothing distributes - which is
also why `IsAny<string | number>` comes out as a single `false`.

Left to you: which two literals to use. Any non-assignable pair works; pick
the one that will still read as deliberate in six months.
