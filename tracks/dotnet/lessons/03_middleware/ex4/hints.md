## Hint 1

Three pieces, in this order: something that runs for everyone, something that
runs only for the admin paths, and something that catches whatever is left.

The last one is a terminal. The middle one is a branch. The first one is an
ordinary link in the chain — and it has to be first, or the branch will
terminate before it gets a turn.

## Hint 2

- `pipeline.Use(async (context, next) => { …; await next(context); })` for the
  shared header.
- `pipeline.UseWhen(predicate, branch => { … })` for the split. The predicate
  takes an `HttpContext` and returns a `bool`; use
  `context.Request.Path.StartsWithSegments("/l03/branch/admin")`.
- `pipeline.Run(context => context.Response.WriteAsync("default"))` at the end.

Inside the branch you also want a terminal, because a branch that falls through
would carry on to the main pipeline's `Run` and answer `"default"`.

## Hint 3

```csharp
pipeline.Use(async (context, next) =>
{
    context.Response.Headers[/* … */] = /* … */;
    await next(context);
});

pipeline.UseWhen(
    context => context.Request.Path.StartsWithSegments(/* … */),
    admin => admin.Run(context => context.Response.WriteAsync("admin")));

pipeline.Run(/* … */);
```

Note that the path in the predicate is the *full* request path — this pipeline
is mounted on a route, not with `Map`, so nothing has been stripped off the
front.
