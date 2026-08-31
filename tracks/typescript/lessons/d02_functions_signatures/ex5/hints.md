## Hint 1

Two overload signatures, then the implementation signature, then one body. The
overloads are the only thing callers see; the implementation signature is not
callable from outside at all, so it is allowed to be the loose union.

## Hint 2

The normalising rule is `trim()`, then `toLowerCase()`, then
`.replace(/\s+/g, "-")` - the `+` is what turns a run of spaces into one dash
rather than several.

Write it once for the scalar case and let the array case map over it.

Left to you: recursion into your own overloaded function, or a small private
helper. Recursion is shorter; the helper makes the overload resolution easier
to explain when someone asks.
