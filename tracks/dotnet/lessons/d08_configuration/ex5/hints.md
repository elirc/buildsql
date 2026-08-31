## Hint 1

`GetSection` never returns null, so `section == null` is not the question. There
is a method that answers "is there anything here at all".

The two numbers are ex1 again: read with a default rather than reading and
hoping.

## Hint 2

```csharp
var section = configuration.GetSection("Dojo:D08:Limits");
section.Exists();                                            // has a value or children
configuration.GetValue("Dojo:D08:Limits:MaxItems", 50);
configuration.GetValue("Dojo:D08:Limits:TimeoutSeconds", 30);
```

`Exists()` is true when the section has a value or at least one child.

The reason to supply a default on every read is in the failure message:
`GetValue<int>` with no default silently gives you `0`, and `0` is a
plausible-looking timeout that nothing will warn you about.
