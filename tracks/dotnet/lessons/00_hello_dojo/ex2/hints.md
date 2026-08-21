## Hint 1

This handler has two jobs and they need two different results, so it can no
longer be a single expression: give it a body with braces.

Job one is the happy path — echo the message and its length. Job two is
deciding when there is no message at all. Read the gate again and count how
many *different* ways it sends "nothing": there are three.

## Hint 2

Deal with the bad input first and return early; that keeps the happy path
unindented. The check you want covers null, `""` and `"   "` in one call —
`string` has a static method for exactly that trio, and its name says all
three.

For the failure, `TypedResults.BadRequest()` with no argument is a 400 with no
body, which is all the gate asks for. For the success, `TypedResults.Ok` of an
`EchoResponse`.

## Hint 3

The shape is:

```csharp
private static IResult Echo(string? message)
{
    if (/* the null-or-whitespace check */)
    {
        return TypedResults.BadRequest();
    }

    return TypedResults.Ok(new EchoResponse(message, /* how long is it? */));
}
```

`string` has a `Length` property. And note that after the early return the
compiler knows `message` is not null, so you can use it without a `!`.
