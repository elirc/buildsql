## Hint 1

One `catch (Exception ex)` doing two things: one line for the operator, one for
the client.

The `logger` is already there as a constructor parameter — a middleware is built
once, and so is its logger, so this is not a captive dependency.

## Hint 2

The log call is `logger.LogError(exception, template, args)`. The exception goes
in the **first** parameter, on its own; it is not part of the message. That slot
is what carries the stack trace through to whatever sink you are using.

The template needs one placeholder for the path, and it has to be spelled
`{Path}` because the gate looks for a property with that name.
`context.Request.Path.Value` is the string.

Then the same generic 500 ProblemDetails as ex1's third branch.

## Hint 3

```csharp
catch (Exception ex)
{
    logger.LogError(ex, "Unhandled exception for {Path}", context.Request.Path.Value);

    await Results.Problem(
            title: "An unexpected error occurred.",
            statusCode: StatusCodes.Status500InternalServerError)
        .ExecuteAsync(context);
}
```

If the gate says "no exception attached", you wrote
`logger.LogError("...{Exception}", ex)` or interpolated it — put it in the
dedicated first parameter instead.
