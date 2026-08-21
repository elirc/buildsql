## Hint 1

All three bodies are one line, and all three use the same operator.

`with` produces a copy of a record with some properties replaced:
`order with { Status = "shipped" }`. Everything you do not name is carried over
unchanged, and the record you started from is untouched.

## Hint 2

`AddOneUnit` needs two changes in one copy. The braces take a comma-separated
list:

```csharp
return order with { Quantity = order.Quantity + 1, Status = "amended" };
```

Note that the right-hand side reads `order.Quantity` — the *old* value. A
`with` expression is not a sequence of assignments; every value is computed
from the original.

## Hint 3

`DiffersOnlyInStatus` is the clever one, and the prompt tells you the trick:
make one comparable to the other. Copy `a` with `b`'s status, then compare with
`==`. If they are equal now, status was the only thing that differed.

```csharp
return a with { Status = b.Status } == b;
```

That works because records compare by value, so one `==` covers every remaining
property — including ones added to the record later, which the by-hand version
would silently ignore. Whether you find that clever or too clever is a
legitimate style call; know that it is available.
