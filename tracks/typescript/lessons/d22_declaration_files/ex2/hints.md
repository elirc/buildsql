## Hint 1

Overload signatures are written as bodiless declarations immediately above the
implementation. Only they are visible to callers; the implementation signature
is not one of the overloads.

## Hint 2

The implementation signature has to accept every argument the overloads accept
and return something every overload's return type fits into - `string | number`
in, a union of the two shapes out.

Left to you: this could also be a generic with a conditional return type. Write
both and compare the error message a caller gets when they pass a boolean; that
is usually what decides it.
