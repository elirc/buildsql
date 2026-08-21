## Hint 1

Both methods return `IEnumerable<int>`, and both must be *iterators* — methods
containing `yield`. The gate proves it: it checks that calling your method
reads **nothing** from the source, and that taking three results does not walk
a thousand items.

If you build a `List<int>` and return it, both of those checks fail, even
though the values would be right.

## Hint 2

`yield return x;` hands one item to whoever is enumerating and *pauses the
method there*. The next `MoveNext` resumes on the following line, with every
local variable exactly as you left it.

```csharp
foreach (int number in numbers)
{
    if (/* even */)
    {
        yield return number;
    }
}
```

`yield break;` ends the sequence immediately — the equivalent of `return` in an
ordinary method.

## Hint 3

`WhileBelow` is the one where the difference shows. "Stopping at the first item
that is not below the limit" means `yield break` on that item — not `continue`,
which would skip it and carry on, and not a filter, which would keep looking.
The gate's `{ 1, 2, 3, 9, 4 }` case separates the two: a filter would return the
4, and stopping does not.

Left to you: whether to write these with LINQ instead (`numbers.Where(...)` and
`numbers.TakeWhile(...)` are exactly these two methods). Lesson 10 does that,
and the whole reason it will make sense is that you wrote the iterator version
first and know there is no list hiding inside it.
