## Hint 1

Two halves. In `Register`, you need one options registration per child section
of `Dojo:Feeds` — and you are not allowed to type the names, because the point
is that adding a third feed should be a configuration change.

In the handler, you need to turn a name into options, and to notice when the
name is not one you have.

## Hint 2

`configuration.GetSection(ChallengeServices.Section).GetChildren()` gives you an
`IConfigurationSection` per feed. Each one has a `Key` (`"primary"`) and *is*
itself a configuration section you can bind — so a `foreach` with
`services.Configure<FeedOptions>(child.Key, child)` inside is the whole
registration.

In the handler, `feeds.Get(name)` returns the named instance. It never throws
and never returns null, so it cannot tell you whether the feed exists — ask
configuration that question instead. `IConfigurationSection` has an `Exists()`
extension method.

## Hint 3

```csharp
foreach (var feed in configuration.GetSection(Section).GetChildren())
{
    services.Configure<FeedOptions>(feed.Key, feed);
}
```

and in the handler, build the section path with interpolation
(`$"{ChallengeServices.Section}:{name}"`), return `TypedResults.NotFound()`
when it does not exist, and otherwise read `feeds.Get(name)` into a
`FeedResponse`. Note that `name` goes into the response too — the gate does not
check it, but a client that asked for one feed and got another's URL would
never know.
