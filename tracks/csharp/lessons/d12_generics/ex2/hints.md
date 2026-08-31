## Hint 1

A generic *type* puts the parameters on the class: `Pair<TFirst, TSecond>`.
Every member can then use them, and every distinct set of arguments -
`Pair<int, string>`, `Pair<string, int>` - is a genuinely different type at run
time.

`Swapped()` is the interesting member, because its return type is
`Pair<TSecond, TFirst>` - the same generic type with the arguments the other
way round.

## Hint 2

```csharp
public Pair<TSecond, TFirst> Swapped() => new Pair<TSecond, TFirst>(Second, First);
```

Nothing clever is needed; the compiler simply substitutes.

`ToString` is `$"({First}, {Second})"`. Interpolation calls `ToString` on each
component, and for a `T` that is null it produces the empty string rather than
throwing - which is worth knowing before you write a null check that never
fires.

Naming convention: type parameters start with `T`, and when there is more than
one they get descriptive names (`TFirst`, `TKey`, `TResult`). A bare `T` is
fine when there is only one and its role is obvious.
