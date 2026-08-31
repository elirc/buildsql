## Hint 1

`with` copies the record one level deep. `person with { Name = "X" }` gives a
new `Person` pointing at the *same* `Address` object - which is fine when the
address is immutable, and is the whole bug when it is not.

So changing a nested value means rebuilding the nested record too, and `with`
nests happily inside `with`.

## Hint 2

```csharp
person with { Home = person.Home with { City = city } }
```

For the patterns, a positional record can be matched by position:
`Person(_, Address(_, "UK"))` matches anyone whose home country is "UK",
without naming a single property. A pattern can also capture:
`Person(_, Address(_, string country))`.

`Classify` is one switch expression with the four arms in the order given.
Arms are tried top to bottom, which is why a long UK name still classifies as
"UK" - the gate checks exactly that.

Left to you: whether `SameCountry` reads better as a pattern or as
`a.Home.Country == b.Home.Country`. The property version is shorter and clearer
here; the pattern version generalises when you start needing several components
at once. Be able to argue for the one you chose.
