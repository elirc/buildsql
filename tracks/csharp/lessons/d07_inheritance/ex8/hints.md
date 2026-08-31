## Hint 1

The pattern is that a node holds other nodes *typed as the base class*, so
`Add` never knows whether its left side is a literal, another `Add`, or a
hundred-deep tree. Each method is one line: do this node's bit, and ask the
children for theirs.

`Literal` is the base case of every recursion here. Get it right first.

## Hint 2

```csharp
public override int Evaluate() => Left.Evaluate() + Right.Evaluate();
public override int NodeCount() => 1 + Left.NodeCount() + Right.NodeCount();
```

There is no `if` anywhere, and no test of what kind a child is. That absence is
the point: adding a `Subtract` class later means writing one new class and
changing nothing that already exists.

Notice how the work is split between `BinaryExpr` and its two subclasses.
`ToText` and `NodeCount` are identical for every binary operator, so they live
once in the middle class; only `Symbol` and `Evaluate` differ. Finding that
line - what is shared, what varies - is the whole craft of designing a
hierarchy.

Left to you: `Symbol` is `protected abstract` so only the hierarchy can see it.
Ask yourself what would change if it were public, and whether the answer is
"nothing useful".
