## Hint 1

Read the supplied version and count the calls. `Min(cost)` runs the cost
function on every item, and then `First(item => cost(item) == lowest)` runs it
again on the items it looks at.

To call it once per item you have to remember two things as you go, not one.

## Hint 2

```csharp
string? best = null;
int bestCost = 0;

foreach (string item in items)
{
    int itemCost = cost(item);       // exactly once, and stored
    if (best is null || itemCost < bestCost) { best = item; bestCost = itemCost; }
}
```

Keeping `bestCost` alongside `best` is the whole trick: without it, comparing
the current item to the best one means asking the cost function about the best
one again.

`items.MinBy(cost)` does exactly this and evaluates the selector once per
element, so it is a perfectly good answer too - decide for yourself whether the
loop or the operator says it more clearly here, and note that they differ in
what they do when the sequence is empty.

The tie is a decision: `<` keeps the first of two equal costs and `<=` keeps
the last. The summary asks for the first.
