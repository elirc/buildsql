## Hint 1

Two things to do, and the first enables the second: give the route endpoint a
*name*, then ask the framework to build URLs for that name instead of writing
the strings yourself.

The name to use is already declared for you as `Ex7.RouteName`.

## Hint 2

`app.MapGet(...).WithName(Ex7.RouteName)` — the call chains onto the mapping and
returns the same builder.

In the link handler, the injected `LinkGenerator` has an overload that takes an
`HttpContext`, a name and an anonymous object of route values. Use the anonymous
object's property names to line up with the template's parameters: `new { id }`
fills `{id}`.

Guard the id range before you generate anything, and remember `next` is `null`
on the last route rather than a link to a route that is not there.

## Hint 3

```csharp
string self = links.GetPathByName(http, RouteName, new { id })!;
string? next = id < Network.Lines.Count
    ? links.GetPathByName(http, RouteName, new { id = id + 1 })
    : null;
```

`GetPathByName` returns `string?` because a name that matches nothing yields
`null` — the `!` above says "I mapped it two lines up". If you are getting
`null` at runtime, the `WithName` did not take, and that is the bug rather than
the generator.

One decision is still yours: which ids are valid at all, and what the endpoint
does about the ones that are not.
