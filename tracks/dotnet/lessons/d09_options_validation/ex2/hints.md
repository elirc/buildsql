## Hint 1

Two halves. Put the constraints on the class as attributes — and then add the
one call that makes anything actually run them.

Attributes on an options class are inert by default. That is the whole trap.

## Hint 2

```csharp
[Required]
public string Host { get; set; } = "";

[Range(1, 65535)]
public int Port { get; set; } = 25;
```

…from `System.ComponentModel.DataAnnotations`, which the file already imports.

Then:

```csharp
services.AddOptions<SmtpOptions>()
    .BindConfiguration("Dojo:D09:Smtp")
    .ValidateDataAnnotations();
```

The failure arrives as an `OptionsValidationException` the first time something
reads `.Value` — which the given endpoint already catches and turns into the
500 the gate is looking for.

`[Required]` on a string rejects `""` too, which is what you want: a key present
and empty is the same as absent.
