## Hint 1

The stub reads the `value` prop once, to seed its own state, and then ignores
it for ever. A controlled value is not a starting point — it is the answer,
every render.

## Hint 2

Two modes. When `value` is given, return it and let the setter do nothing but
call `onChange`; when it is not, keep the value in state as the stub does and
call `onChange` as well. Which mode you are in is decided by whether `value`
was supplied.

## Hint 3

Decide that **once** and remember it — a component that switches modes halfway
through its life makes its value appear to jump, and the warning React's own
inputs print about exactly this is worth reading. And call `useState`
unconditionally either way: the number of hooks a component calls may not
depend on a prop.
