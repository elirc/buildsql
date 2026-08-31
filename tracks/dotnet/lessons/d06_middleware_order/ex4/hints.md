## Hint 1

You need a branch that runs for some requests and then puts them back on the
main road, so the terminal handler is still reached either way. One of the
`IApplicationBuilder` branching methods does exactly that; the other one does
not come back.

The predicate is about the request path.

## Hint 2

```csharp
pipeline.UseWhen(
    context => context.Request.Path.StartsWithSegments("/d06/when/admin"),
    branch => branch.UseMiddleware<MarkMiddleware>("admin"));
```

…registered *before* the `common` marker, because the expected trace has `admin`
outside it.

Use `StartsWithSegments`, not `Path.Value.StartsWith("/d06/when/admin")`: the
first respects segment boundaries, so it will not match a future
`/d06/when/administrators`. That difference has been a real security bug in real
applications.
