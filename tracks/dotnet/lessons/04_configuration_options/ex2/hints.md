## Hint 1

Three jobs: give two properties defaults, bind the class, return it. The
binding and the handler are exactly ex1 with different names.

The defaults are the interesting part. Look at `Dojo:Reports` in
`appsettings.json` and notice how few keys are in it, then look at the values
the gate expects.

## Hint 2

A default is just a property initialiser: `public string Format { get; set; } = "csv";`.
The binder overwrites a property only when it finds a matching key, so anything
configuration does not mention keeps whatever the initialiser set.

`MaxRows` needs one too, even though configuration overrides it — that default
is what the application would use if someone deleted the section.

## Hint 3

```csharp
public int MaxRows { get; set; } = 100;
public string Format { get; set; } = "csv";
public bool IncludeHeaders { get; set; } = true;
```

The `IncludeHeaders` one is the trap: leave it alone and it is `false`, which
looks like a deliberate choice and is not. Then bind with
`services.Configure<ReportOptions>(configuration.GetSection("Dojo:Reports"))`
and return `options.Value`.
