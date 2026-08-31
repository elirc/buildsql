## Hint 1

Three different questions hide behind the word "equal":

- **Same object?** `object.ReferenceEquals(a, b)` - never overridable, always
  asks about identity.
- **Equal by the type's own rules?** `a.Equals(b)` - virtual, so the type
  decides. A plain class inherits `object.Equals`, which is identity again.
- **What does `==` do?** Whatever the type overloaded it to do, or identity
  when it has not.

## Hint 2

Each method here is one line, and the exercise is knowing which of the three
you are being asked for.

`string` is the type that makes this vivid: it overloads `==` to compare
characters, so `"ab" == built` is true even when the two are different objects
on the heap. `ReferenceEquals` sees through that and answers false.

Be careful how you build the second string if you experiment yourself: the
compiler folds `"a" + "b"` into a single interned literal, so it really would
be the same object. Only a string built at run time - from a `char[]`, a
`StringBuilder`, or user input - is a genuinely separate instance.

`Box` overrides nothing, so `BoxesEqual` on two boxes holding 1 is false. That
is not a bug in `Box`; it is the correct default for a type that has not said
what equality means.
