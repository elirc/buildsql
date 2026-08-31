## Hint 1

A construct signature is written `new (...args) => Something`, and `infer`
works in its return position exactly as it does for a plain function. Match
that shape, not a plain call signature.

## Hint 2

`C extends new (...args: any[]) => infer R ? R : never`. The `new` keyword in
the pattern is what makes `typeof Beacon` match and `() => Beacon` fail - the
gate probes both.
