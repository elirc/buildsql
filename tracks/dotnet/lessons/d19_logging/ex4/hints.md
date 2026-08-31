## Hint 1

The two log calls are already right. What is wrong is where the logger came
from: a hand-written category string is a magic constant that does not follow
the class and cannot be filtered by namespace.

## Hint 2

Change the handler's parameter from `ILoggerFactory factory` to
`ILogger<Ex4> logger` and delete the `CreateLogger` line. `ILogger<T>` is
registered open-generic, so it needs no registration of your own, and the
framework derives the category from the type - which is exactly the shape every
`appsettings.json` logging filter is written against.
