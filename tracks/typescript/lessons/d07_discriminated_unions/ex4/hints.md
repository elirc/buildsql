## Hint 1

`version: 1` and `version: 2` - number literals are types too, and they
discriminate exactly like string ones.

Watch out for the comparison you use. `frame.version >= 2` is a range check and
narrows nothing; only an equality against a literal does.

## Hint 2

Take the v1 branch first and return from it, and the rest of the body knows it
has a v2 frame - so `payload.join("|")` and `codec` are both legal without a
second guard.

Left to you: a ternary for the codec, or a second `if`. Two variants, one line
either way.
