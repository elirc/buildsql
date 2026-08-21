## Hint 1

Three short bodies, and none of them may mention a concrete type. If you catch
yourself writing `int`, `string` or `object` anywhere, back out — the method
signature already gave you a name for the type: `T`.

`FirstOr` has a subtlety worth spotting before you start: you cannot write
`return null` for "no first item", because `T` might be an `int`.

## Hint 2

The simplest way to take the first item of an `IEnumerable<T>` is to `foreach`
and `return` inside the loop — the first iteration is the first item, and if
the loop body never runs there was nothing there.

```csharp
foreach (T item in items)
{
    return item;
}
return fallback;
```

`Swap` needs a third variable to hold one value while you overwrite it. `ref`
means both parameters are aliases for the caller's variables, so assigning to
them is what the caller sees.

`CountOf` is a counter and a `foreach`.

## Hint 3

Everything here works for *any* `T` because none of it asks anything of `T` —
no comparison, no construction, no member access. That is why no constraint is
needed, and it is the honest test of whether a method should be generic at all.

One decision left: `FirstOr` could use LINQ's `FirstOrDefault`, and `CountOf`
could use `Count()`. Both exist and both are what you would write in real code
(lesson 10). Writing the loops once, by hand, is what makes the LINQ versions
stop being magic.
