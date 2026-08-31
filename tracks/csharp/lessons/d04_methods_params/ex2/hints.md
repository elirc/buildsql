## Hint 1

`params` is a caller-side convenience: inside the method the parameter is an
ordinary array, and it is **never null** when the method is called normally -
callers who pass nothing get an empty array. So `foreach` over it needs no
guard.

Both methods are one loop with one filter. `string.IsNullOrWhiteSpace` is the
filter again.

## Hint 2

`Trim('/')` removes the character from both ends, and it is separate from
`Trim()`, which removes whitespace - you want both, in that order:

```csharp
string trimmed = part.Trim().Trim('/');
```

A part that was only slashes is now empty, so test the length again before
keeping it.

Collect the survivors into a `List<string>` and finish with
`string.Join("/", kept)`. Building the string as you go means handling "is this
the first one?" for the separator; the join has already solved that.

Left to you: whether `First` returns early from the loop or uses LINQ's
`FirstOrDefault`. The loop is what the exercise is about, but be ready to write
the one-liner too.
