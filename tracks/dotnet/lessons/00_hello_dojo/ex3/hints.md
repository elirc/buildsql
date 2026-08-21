## Hint 1

Structurally this is ex2 again: validate, return 400 if the input is not
usable, otherwise return 200 with a record. The only new thing is where the
value comes from.

`GreetingRequest` is a complex type, so ASP.NET Core has already read the JSON
body and handed you the object. There is nothing to parse — reach into the
parameter.

## Hint 2

`request.Name` is `string?`, so the same null-or-whitespace guard from ex2
applies before you use it.

For the greeting itself, C# string interpolation (`$"..."`) is the readable
way to build `"Hello, Ada!"` from a name. Watch the punctuation: comma after
"Hello", exclamation mark at the end, no trailing space.

## Hint 3

The shape is:

```csharp
private static IResult Greet(GreetingRequest request)
{
    if (/* the same guard as ex2, on request.Name */)
    {
        return TypedResults.BadRequest();
    }

    return TypedResults.Ok(new GreetingResponse($"Hello, {/* … */}!"));
}
```

The `$` prefix is the part people forget: without it you would return the
literal characters `{request.Name}` and the gate would show them to you.
