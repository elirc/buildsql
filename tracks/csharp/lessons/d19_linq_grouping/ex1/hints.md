## Hint 1

`GroupBy(word => word[0])` gives you one group per distinct first letter. A
group is an `IGrouping<char, string>`: it has a `Key`, and it *is* a sequence
of the words that had that key - so `group.ToList()` and `group.Count()` both
work on it without any unwrapping.

`ToDictionary` takes a key selector and a value selector, which is exactly the
pair you need for the first method.

## Hint 2

```csharp
words
    .GroupBy(word => word[0])
    .ToDictionary(group => group.Key, group => group.ToList());
```

For `CountByLength`, group by `word.Length` instead, order the *groups* by
`group.Key`, and project each one to `$"{group.Key}:{group.Count()}"`.

Note the thing the gate checks with the letter 'z': `GroupBy` never produces a
group for a key nothing had. That is right for most reports and wrong for a
histogram, which is what ex8 is about.
