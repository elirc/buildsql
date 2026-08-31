## Hint 1

A `string` in .NET is immutable, so `result += word` in a loop allocates a
whole new string every time round - N appends cost O(N^2) copying.
`StringBuilder` keeps one growable buffer and copies once, at `ToString()`.

The separator rule is the usual off-by-one: it belongs *between* items, so
there is one fewer separator than there are copies.

## Hint 2

The cleanest way to get "between" right is to append the separator *before*
every item except the first:

```csharp
for (int i = 0; i < times; i++)
{
    if (i > 0) builder.Append(separator);
    builder.Append(word);
}
```

A negative `times` needs no guard - the loop condition is already false.

For `Reverse`, walk the indexer backwards from `text.Length - 1` down to 0.
`new string(chars)` over a reversed `char[]` and `string.Concat(text.Reverse())`
both work too; be ready to say which allocates less.
