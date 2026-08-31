## Hint 1

Two stacks: `_back` and `_forward`. `Back` pushes `Current` onto `_forward`
and pops `_back` into `Current`; `Forward` is the mirror image. Each guard
is a `Count` check that returns false and touches nothing.

## Hint 2

`Visit` is three steps, and the third is the one people forget:

```csharp
_back.Push(Current);
Current = url;
_forward.Clear();
```

## Hint 3

Why the clear: after home -> a -> b, Back, Back, you are at home with
forward = [a, b]-ish state. Visiting c from home starts a NEW branch of
history; b and a are no longer "ahead" of anywhere you can reach. The gate
visits, goes back, visits somewhere new, and then insists `Forward()` is
false - if yours still moves, the old future leaked. Which stack the leaving
page goes onto in each method is the one decision left to you.
