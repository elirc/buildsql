## Hint 1

You cannot write this with a fixed number of joins, because you do not know how
deep the tree goes. The flattening operator has to call the method that uses
the flattening operator:

```csharp
node.Children.SelectMany(child => Walk(child, ...))
```

Start each method by asking what it should answer for a node with no children.
That is the base case, and it is where the bugs live.

## Hint 2

`Leaves`: a node with no children is a leaf and contributes its own name; a
node with children contributes only what its children contribute, and nothing
of its own.

`Depth`: a leaf is 1; anything else is 1 plus the deepest child. Note that
`Max` over an empty sequence throws, so the leaf case has to be checked before
the recursion, not inside it.

## Hint 3

`Paths` needs an accumulator, so write a private helper that takes the node and
the prefix built so far:

```csharp
private static IEnumerable<string> Walk(Category node, string prefix)
{
    string path = prefix.Length == 0 ? node.Name : $"{prefix}/{node.Name}";
    return new[] { path }.Concat(node.Children.SelectMany(child => Walk(child, path)));
}
```

Passing the prefix *down* is what makes each node's work constant - the
alternative, walking back up to the root from each node, is the same answer
computed quadratically.

`Concat` of the one-element array with the flattened children is what puts each
parent immediately before its own subtree. Swap those two around and you have a
post-order walk instead, which is equally valid and not what the gate asks for.
