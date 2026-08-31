## Hint 1

This is ex2 with a bigger class. One `Get<T>()` call handles all of it — the
enum, both `TimeSpan`s, the list of objects and the nested object — and you write
no parsing at all.

The rest of the exercise is projecting the bound object into the response shape.

## Hint 2

```csharp
var feed = configuration.GetSection("Dojo:D08:Feed").Get<FeedSettings>() ?? new FeedSettings();
```

Then read `feed.Mode.ToString()`, `(int)feed.Interval.TotalSeconds`, the
endpoints as `$"{e.Url}|{e.Weight}"`, and the two retry values.

The conversion rules doing the work: enums bind **by name**, case-insensitively;
`TimeSpan` binds from `"hh:mm:ss"`; a list of objects binds from
`Endpoints:0:Url`, `Endpoints:0:Weight`, index first.

## Hint 3

The check worth predicting before you run it is `backoffSeconds`. Configuration
sets `Retry:Count` and says nothing about `Retry:Backoff` — and the nested
object's own default of two seconds survives, because the binder never blanks a
property it found no key for, **at any depth**.

One sharp edge to file away: enums also bind by *number*, so `"Mode": "3"` on a
two-value enum silently produces `(FeedMode)3` and fails somewhere far from the
configuration file. If that matters, validate — which is exactly what d09 is
about.

Left for you: the projection, and deciding whether `?? new FeedSettings()` is
paranoia or necessary. (Run the gate's no-configuration case and find out.)
