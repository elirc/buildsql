## Hint 1

The bus is a `Dictionary<string, Command>` keyed by `command.Name`, so
registering is one assignment (which replaces on a repeat, exactly as the
specification wants) and dispatching is one `TryGetValue`.

`Run` needs the FIRST space only: `IndexOf(' ')`, then two `Substring` calls.

## Hint 2

```csharp
string trimmed = line.Trim();
int space = trimmed.IndexOf(' ');
string word = space < 0 ? trimmed : trimmed.Substring(0, space);
string argument = space < 0 ? "" : trimmed.Substring(space + 1).Trim();
```

`Split(' ')` would break `"echo hello world"` into three pieces and lose the
argument's shape - the first-space rule is what keeps the rest intact.

`HelpCommand` is the design point. It holds a reference to the bus it was
registered with, so it can answer a question about its own neighbours - which
means the bus has to expose `Names`. That circularity is normal for plugin
systems, and the ordering matters: `Names` sorts explicitly because a
`Dictionary` promises no order at all.

Left to you: `Register(new HelpCommand(bus))` requires the bus to exist first,
so the chain cannot include it. Consider whether `Register` should take a
factory instead, and what that would cost in readability.
