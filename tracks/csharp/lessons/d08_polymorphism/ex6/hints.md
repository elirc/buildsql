## Hint 1

Every rule has the same signature and returns `null` for "fine". That single
shape is what lets a caller hold a list of them without knowing what any of
them do.

`FirstError` returns as soon as a rule complains. `AllErrors` keeps going.
Both are one loop.

## Hint 2

```csharp
foreach (Rule rule in rules)
{
    string? complaint = rule.Check(input);
    if (complaint is not null) return complaint;
}
return "";
```

Note the two different "nothing" values in play: a rule says "fine" with
`null`, and the *collection* of rules says "fine" with `""`. Mixing them up is
the classic bug here - and it is worth asking whether the API would be better
with one convention. (It would; the split exists so you notice.)

`DigitsOnly` on empty text returns null, because `"".All(...)` is true - every
one of its zero characters is a digit. That is not an accident to work around:
each rule does exactly one job, and "is it there at all?" is `NotBlank`'s.

Left to you: `AllErrors` could be written with LINQ in two lines. Write the
loop first, then the LINQ, then decide which one you would want to read in six
months.
