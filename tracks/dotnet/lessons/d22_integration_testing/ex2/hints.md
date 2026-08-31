## Hint 1

Ask what a test would have to do to make this handler say a particular date.
With `DateTimeOffset.UtcNow` there is no answer - the value is fetched from the
machine, and nothing outside the handler can influence it. That is the
definition of an untestable dependency.

## Hint 2

`TimeProvider` is the abstraction over "now", and `Model.cs` already registers
`TimeProvider.System`. Take a `TimeProvider clock` parameter and read
`clock.GetUtcNow()`; the rest of the handler is unchanged, including
`D22Library.Stamp` and the `AddDays`.
