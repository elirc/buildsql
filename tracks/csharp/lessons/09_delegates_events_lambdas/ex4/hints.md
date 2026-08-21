## Hint 1

Both methods **return a function**. Neither of them does the work now — they
build something that will do the work later, when someone calls it.

So the body of each is mostly a lambda, and everything inside that lambda runs
per invocation, not once at build time.

## Hint 2

`Compose` returns a lambda that loops the steps, feeding each result into the
next:

```csharp
return input =>
{
    string current = input;
    foreach (Func<string, string> step in steps)
    {
        // current becomes the result of this step
    }
    return current;
};
```

With no steps, the loop never runs and `current` is still the input — the empty
case falls out for free, exactly as `string.Join` did in lesson 02.

`Combine` returns a lambda that calls each half with `?.Invoke()`, so a null
half is skipped.

## Hint 3

Note what `Combine` must NOT do: return `null` when both arguments are null.
The gate calls the result immediately, so it has to be a real (if empty)
`Action`. Returning something harmless rather than null is the same null-object
idea as lesson 08's review.

Left to you: C# can also combine delegates with `+` (`first + second`), which
is *multicast* — the same mechanism events use, and it handles nulls
correctly all by itself. Try that version too and decide which one you would
rather read in six months.
