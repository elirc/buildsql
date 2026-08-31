## Hint 1

Both methods are the same loop pointed in opposite directions, and both return
from inside the loop the moment they find a match. The `return` *is* the early
exit - no `break` and no found-flag needed.

The value to return when nothing matches is decided once, after the loop.

## Hint 2

Forwards is the familiar shape. Backwards is where the off-by-one lives:

```csharp
for (int i = values.Length - 1; i >= 0; i--)
```

`values.Length` is not a valid index, and `i > 0` would never look at element 0.
Both mistakes pass the four-element test in the gate and fail the empty one -
which is why the empty case is there.

Left to you: whether `LastIndexOf` walks backwards and returns early, or walks
forwards remembering the most recent hit. Both are correct; one reads the
target array fewer times on average, and being able to say which is the point.
