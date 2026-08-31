## Hint 1

`Tag` overrides `Equals` and `GetHashCode` but deliberately does **not**
overload `operator ==`. Write the three methods exactly as described and then
predict what each one answers for two different `Tag` objects with the same
name.

`==` on a class that has not overloaded it is reference comparison, decided at
**compile time** from the static types of the operands.

## Hint 2

```csharp
public static bool EqualsSays(Tag a, Tag b) => a.Equals(b);
public static bool OperatorSays(Tag a, Tag b) => a == b;
public static bool ListContains(List<Tag> tags, Tag tag) => tags.Contains(tag);
```

`EqualsSays` is true, `OperatorSays` is false, `ListContains` is true - and the
third is the one that catches people out. `List<T>.Contains` uses
`EqualityComparer<T>.Default`, which uses `Equals`, not `==`. So your type has
two different notions of equality depending on which syntax the caller reached
for.

That is why the guidance is to overload `==` and `!=` whenever you override
`Equals` on a type that feels like a value - or to make it a `record`, which
does all of it for you. `string` and `record` both overload `==`; most classes
do not, and a mixed codebase where some do and some do not is a reliable source
of bugs.
