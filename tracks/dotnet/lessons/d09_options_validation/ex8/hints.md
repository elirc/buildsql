## Hint 1

Four things, and each one is a separate call you have already made in an earlier
exercise: bind (ex1), derive (ex6), annotations (ex2), predicate (ex3).

Nothing here implies anything else. That is the lesson.

## Hint 2

The attributes go on the class:

```csharp
[Required] public string Name { get; set; } = "";
[Range(1, 64)] public int Workers { get; set; } = 1;
```

…and the chain does the rest:

```csharp
services.AddOptions<PipelineOptions>()
    .BindConfiguration("Dojo:D09:Pipeline")
    .PostConfigure(options => options.Label = $"{options.Name}:{options.Mode}:{options.Workers}")
    .ValidateDataAnnotations()
    .Validate(options => Modes.Contains(options.Mode), "Mode must be batch or stream.");
```

`PostConfigure` is available on the `OptionsBuilder` too, so it can sit in the
chain rather than as a separate `services.PostConfigure<T>(...)` call.

## Hint 3

Check the ordering claim yourself: `PostConfigure` runs **before** validation, so
`Label` exists by the time the rules look at the object — which means a rule
could validate the derived value if you wanted it to.

Worth doing once the gate is green: pull the whole block into an extension
method, `services.AddPipelineOptions()`, and see how much better the composition
root reads as a list of features than as a list of framework calls. That is what
you would actually ship.

Left for you: assembling the chain, and predicting which of the three bad
configurations produces which message before you run it.
