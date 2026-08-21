## Hint 1

Validate, store, then choose between two success codes. The whole handler is
about five lines.

`ISettingStore.Set` returns a `bool` and its meaning is the branch you need —
read the summary comment on the interface.

## Hint 2

Blank value first: `TypedResults.ValidationProblem` with a dictionary keyed
`"value"`.

Then `bool created = store.Set(key, request.Value);` and return
`TypedResults.Created($"/i2/settings/{key}", …)` when it created something,
`TypedResults.NoContent()` when it replaced one.

Note that you write nothing extra to make the repeat idempotent. "Set this key
to this value" applied twice is indistinguishable from applying it once — that
is what makes PUT the right verb here.

## Hint 3

```csharp
bool created = store.Set(key, request.Value);

return created
    ? TypedResults.Created($"/i2/settings/{key}", new SettingValue(request.Value))
    : TypedResults.NoContent();
```

The `Location` is the same URL the client just PUT to, because the client chose
the identifier — which is exactly the condition that makes PUT-as-create correct
rather than a POST in disguise.
