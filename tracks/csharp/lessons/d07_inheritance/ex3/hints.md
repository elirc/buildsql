## Hint 1

`abstract` means "there is no sensible default, so every subclass must decide".
`virtual` means "here is a default; replace it if you like". Choosing between
them is a design decision that the compiler then enforces for you.

All three members you have to write are one-line expression-bodied properties.

## Hint 2

```csharp
public override string Severity => "INFO";
```

`InfoAlert` deliberately does *not* override `Priority` - leaving the default
alone is the point of the exercise, and the gate checks it comes back as 3.

`PageAlert` overrides both.

Note that `Render` in the base reads `Severity` and `Priority` without knowing
which subclass it is looking at. A base class calling its own abstract members
is the template-method shape, and it is the reason abstract members exist at
all: the base can be written before any subclass is.
