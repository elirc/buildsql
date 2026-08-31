## Hint 1

Run it first and read the 500: the container is being asked for
`TagMiddleware` and has never heard of it. That is the whole difference between
the two kinds of middleware — a convention-based one is constructed by
`UseMiddleware` at startup, and an `IMiddleware` is resolved from the container
on every request.

Resolved on every request means it has to be registered, with a lifetime.

## Hint 2

`services.AddScoped<TagMiddleware>();`

Scoped is what makes the gate's second check pass: the middleware is built once
per request, in the request's own scope, so the `IRequestTag` it receives is the
same object the handler gets from `context.RequestServices`.

Register it as a singleton and the container will refuse to start, because a
singleton may not hold a scoped service — which is exactly the situation
`IMiddleware` exists to escape.

`InvokeAsync` itself is two lines: set the header from `tag.Id`, then
`return next(context);`.
