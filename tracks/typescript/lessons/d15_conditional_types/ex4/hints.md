## Hint 1

Conditional types nest in the false branch, exactly like a chain of ternaries
in JavaScript - and they read the same way once you stop trying to align them.

## Hint 2

Two orderings will bite you. An array is assignable to `object`, so the array
check must come before the object check. And `boolean` is `true | false`, so
distribution splits it before the check even runs - which is harmless here,
because both halves land on the same answer.

Left to you: how to lay the chain out. Nested ternaries or one long line - the
compiler does not care, and your reviewer will.
