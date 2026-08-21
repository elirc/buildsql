## Hint 1

There are two independent decisions here, not four cases. Compute the name
part, compute the age part, then glue them together with one interpolated
string at the end. If you are writing four `if` branches you are treating one
problem as two.

Watch the blank-string case: `"   "` is not null, and it is not `""` either.

## Hint 2

`string.IsNullOrWhiteSpace(name)` answers "missing or blank" in one call, and
the compiler is smart enough to know `name` is not null in the `else` branch.

`int? age` gives you `age.HasValue` and `age.Value`. You may also see
`age is null`, and `age?.ToString() ?? "age unknown"` — all three are fine.
Pick the one you can read back in six months.

## Hint 3

```csharp
string who = /* blank or null? */ ? "anonymous" : name;
string years = /* has a value? */ ? ... : "age unknown";
return $"{who} ({years})";
```

Note that `years` is a `string` in both branches — the conditional operator
needs both arms to be the same type, so the `int` has to become text before it
can sit next to `"age unknown"`. Interpolating it is one way; `ToString()` is
another.
