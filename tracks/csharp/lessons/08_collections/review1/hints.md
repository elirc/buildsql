## Hint 1

A dictionary whose values are lists has one awkward moment, and it is the same
one as ex1: the first time a key appears, there is no list to add to yet.

`For` has the mirror problem on the way out — a caller asking about a letter
that was never seen.

## Hint 2

The standard shape:

```csharp
if (!groups.TryGetValue(key, out List<string>? group))
{
    group = new List<string>();
    groups[key] = group;
}
group.Add(word);
```

Note the list is added to the dictionary *before* it is filled. That works
because the dictionary holds a reference to the list, not a copy of it — lesson
01's value-versus-reference distinction doing real work.

`word[0]` is the first character of a string.

## Hint 3

`For` must return an empty list rather than null, so the caller can `foreach`
the result without a null check. That is a small kindness with a name — the
*null object pattern* — and it removes a whole class of `NullReferenceException`
from calling code.

Left to you: whether the empty list you return should be a fresh one each time
or a shared static. A fresh one is safe; a shared one is cheaper and becomes a
bug the moment a caller adds to what they were given. Think about which
guarantee you would rather make.
