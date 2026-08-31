## Hint 1

`Configure` is handed the branch's `IApplicationBuilder`, so the handler goes on
the front of it:

    pipeline.UseExceptionHandler(errorApp => errorApp.Run(async context => { ... }));

Inside, `context.Features.Get<IExceptionHandlerFeature>()?.Error` is the
exception that was thrown. You need `using Microsoft.AspNetCore.Diagnostics;`.

## Hint 2

Two branches. `error is SailingNotFoundException` is a known failure the domain
expressed by throwing - translate it to a 404 with a real detail. Anything else
is a fault: 404 and 500 need different bodies, and the second one is the
interesting half.

Build a `Microsoft.AspNetCore.Mvc.ProblemDetails`, set
`context.Response.StatusCode`, and write it with

    await context.Response.WriteAsJsonAsync(
        problem, options: null, contentType: "application/problem+json");

## Hint 3

The 500's body must say nothing about the exception. Not its message (which
here contains a production password), not its type name, not a stack frame. A
status, a type, a title, an instance - and everything you know goes to the log
instead. The gate greps the raw body for all three.
