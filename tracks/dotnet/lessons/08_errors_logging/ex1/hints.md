## Hint 1

The skeleton is lesson 03's middleware with a `try` around the `await next(...)`
and three `catch` blocks after it.

Order matters: C# picks the first matching `catch`, so the most general one —
`catch (Exception)` — has to be last, or the two specific ones become
unreachable.

## Hint 2

Each `catch` writes a ProblemDetails and nothing else.
`Results.Problem(title:, detail:, statusCode:)` builds one, and because you are
in middleware rather than a handler you have to run it yourself:

```csharp
await Results.Problem(/* … */).ExecuteAsync(context);
```

`StatusCodes.Status404NotFound` and friends are the named constants.

For the third block: no `detail` argument at all. Leaving it out is the point —
the exception's message is the thing you must not send.

## Hint 3

```csharp
try
{
    await next(context);
}
catch (NotFoundException ex)
{
    await Results.Problem(
            title: "Not Found",
            detail: ex.Message,
            statusCode: StatusCodes.Status404NotFound)
        .ExecuteAsync(context);
}
// … ValidationFailedException -> 400 …
// … Exception -> 500, title "An unexpected error occurred.", no detail …
```

Check the successful path too: with nothing thrown, this method should do
exactly what it did before you wrote it. If `/l08/mapped/fine` stops answering
`ok`, you are writing a response outside the catch blocks.
