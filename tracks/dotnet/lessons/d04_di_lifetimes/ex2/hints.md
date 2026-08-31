## Hint 1

Both lifetimes are right, so the bug is not in `Ex2Services`. Ask when
`ReportBuilder`'s constructor runs, and how many times: once, at startup,
because it is a singleton — and whatever it was handed then is what it still
holds now.

"Transient" describes how often the container *creates* one, not how often your
object *asks* for one.

## Hint 2

Move the resolution from construction time to call time. Take an
`IServiceProvider` in the constructor and call
`services.GetRequiredService<IStamp>()` inside `Build()`.

Two things this is not: `Func<IStamp>` is not supported by the built-in
container, and making the builder scoped would fix the symptom by rebuilding the
singleton every request — and still hand out one stamp per request rather than
one per build.
