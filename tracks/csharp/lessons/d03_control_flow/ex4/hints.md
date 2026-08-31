## Hint 1

Run-length encoding is the classic "inner loop consumes the run" problem. An
outer `while` sits at the start of a run; an inner `while` advances past every
character equal to the one it started on. When the inner loop stops, you know
both the character and the length.

The alternative shape - one loop with a "previous character" variable - works
too, but then you have to remember to emit the final run after the loop, which
is where that version usually breaks.

## Hint 2

```csharp
while (index < text.Length)
{
    char current = text[index];
    int length = 0;
    while (index < text.Length && text[index] == current) { index++; length++; }
    encoded.Append(current).Append(length);
}
```

The order of the `&&` operands is load-bearing: the bounds check must come
first, because `&&` short-circuits and `text[index]` on an exhausted string
throws.

`LongestRunLength` does not need the inner loop at all - one pass comparing
each character with the one before it, resetting the counter when they differ,
is enough. Watch the empty case: the answer is 0, and any code that starts the
counter at 1 before the loop gets it wrong.
