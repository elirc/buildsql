## Hint 1

Four one-line bodies. Three of them are the operator or method named in the
doc comment, applied to the two parameters, and returned.

The instruction that matters: **report what the language says**, do not correct
it. Two of these four return an answer that looks wrong at first glance, and
noticing that is the exercise.

## Hint 2

- `SameObject` — `ReferenceEquals(a, b)`. It is the only way to ask "same
  object?" about types that may have overloaded `==`.
- `StringsEqual` — `a == b`, with both parameters typed `string`.
- `ObjectsEqual` — `a == b`, with both parameters typed `object`.
- `ObjectsDotEquals` — `a.Equals(b)`.

Note that `StringsEqual` and `ObjectsEqual` contain the same characters and are
compiled completely differently, because the operator is chosen from the
**static** type of the operands.

## Hint 3

Predict the gate's four answers before running it, and be ready to say why:

- two strings with the same characters, `==` — ?
- two boxed 5s, `==` — ?
- the same two boxes, `.Equals` — ?

The rule underneath: `==` on a reference type is *reference* comparison unless
someone overloaded it (string did; object did not). `Equals` is *virtual*, so
it dispatches on the runtime type, and `Int32.Equals` compares values.

Left to you: what `object.ReferenceEquals(5, 5)` returns, and why the answer is
awkward. (Both arguments get boxed on the way in.)
