## Hint 1

Three bodies, one line each, no notes. If you cannot write all three inside two
minutes, that is the signal to go back to `i1`'s question bank rather than to
these hints.

Each one is a fact you have been asked before: virtual dispatch, string
immutability, boxing copies.

## Hint 2

- `EqualsSays` is `a.Equals(b)` — report what it says.
- `Trimmed` is `text.Trim()` — returned, not assigned back to `text`.
- `BoxedThenChanged` is four lines: an `int` set to 1, boxed into an `object`,
  the `int` set to 9, then `(int)boxed` returned.

## Hint 3

Predict all three before you run the gate, and say the reason out loud:

- two separately boxed `7`s, compared with `Equals` — and why the answer differs
  from `==`;
- whether the caller's padded string changed;
- what the box holds after the variable moved.

Left to you: whether `EqualsSays(null, x)` should be your problem. The gate never
passes null, and a production version would use `object.Equals(a, b)` — the
static one, which handles nulls on both sides. Worth knowing it exists.
