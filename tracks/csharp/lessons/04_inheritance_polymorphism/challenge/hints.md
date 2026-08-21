## Hint 1

`Render` is written once, in the base class, and never overridden. It calls
three members — one of which does not exist yet in any concrete form — and the
subclasses supply those. That inversion is the whole pattern: the base owns the
*order*, the subclasses own the *content*.

Start with `Render`, then `EmptyReport` (two lines), then `SalesReport`.

## Hint 2

`Render` joins three strings with `"\n"`:

```csharp
return string.Join("\n", $"== {Title} ==", Body(), Footer());
```

`string.Join` has an overload taking loose arguments, so you do not need an
array. Note that `Title` is a property and `Body()`/`Footer()` are methods —
the call syntax differs, the dispatch does not.

`SalesReport.Body` needs a count and a total: loop the `_amounts` array adding
into a `decimal`, and pluralise "sale" the way you did in lesson 00 ex2.

## Hint 3

Watch two details in the expected output. The footer says `"-- 3 rows --"` and
keeps `"rows"` even for one row — match the specification, not your instincts.
And `EmptyReport` does **not** override `Footer`, so it prints the base class's
`"-- end --"`; that contrast between `abstract` (you must supply it) and
`virtual` (you may replace it) is what the exercise is really testing.

Interpolating a `decimal` directly is fine here: the totals are whole numbers,
so `{total}` prints `60`, with no format string and no culture question.
