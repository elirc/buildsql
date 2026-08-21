## Hint 1

Read the type slowly, because it is the hardest part:

```
Func<Func<string,string>, Func<string,string>>
```

A middleware is a function that **takes the next handler and returns a new
handler**. Given `next`, it hands back something that can do a bit of work,
call `next`, and do a bit more work on the way out.

`Build` starts from the core handler and wraps it, one middleware at a time.

## Hint 2

The wrapping direction is the whole exercise. The first middleware listed must
end up **outermost** — so it must be applied **last**:

```csharp
Func<string, string> handler = core;
for (int i = middleware.Length - 1; i >= 0; i--)
{
    handler = middleware[i](handler);
}
return handler;
```

Walk it with two middlewares on paper before you trust it. `middleware[1]` wraps
`core`; then `middleware[0]` wraps that.

## Hint 3

Check your result against the gate's two orderings. `brackets` then `exclaim`
gives `"[hi!]"`; `exclaim` then `brackets` gives `"[hi]!"`. If both come out
the same you built a *sequence*, not a nest — the "on the way out" half of each
middleware never happened.

This is exactly ASP.NET Core's request pipeline. `app.Use(...)` registers a
middleware in this shape, order of registration is order of wrapping, and a
middleware that does not call `next` short-circuits the request — which is how
authentication returns 401 without your controller ever running.

Left to you: whether to reject a null middleware in the array, and whether
`Build` should copy the array before closing over it. Both matter more the
moment the caller can mutate what they passed.
