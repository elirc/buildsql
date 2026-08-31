## Hint 1

Walk the stub through the gate's tree in render order and write down what
`currentZone` holds at each badge. The first two are right by luck; the third
badge renders after the nested provider has already overwritten the variable.

## Hint 2

A module-level variable has one value at a time. A context has one value *per
position in the tree*, which is a different thing entirely — and it is the only
reason nesting a provider inside another one means "for this subtree only".
