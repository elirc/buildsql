## Hint 1

`ByVirtualCall` is one line: `container.Capacity`.

`BySwitch` is a switch expression over the runtime type, deliberately written
knowing about only two of the three subclasses. Write it that way on purpose -
the gate is about what happens when the third one shows up.

## Hint 2

```csharp
container switch
{
    Crate => 12,
    Pallet pallet => pallet.Crates * 12,
    _ => -1,
}
```

Now compare the two methods honestly. The switch is not *wrong* - it is a
perfectly good technique, and for a closed hierarchy you own (a set of
tokens, a parsed AST) it is often clearer than scattering the logic across
subclasses. What it cannot do is stay correct when somebody adds a subclass
somewhere else without reading this file.

The rule of thumb: if the set of *types* is stable and the set of *operations*
keeps growing, switch. If the set of operations is stable and new types keep
arriving, use virtual members. That trade-off has a name - the expression
problem - and it is worth being able to say it.
