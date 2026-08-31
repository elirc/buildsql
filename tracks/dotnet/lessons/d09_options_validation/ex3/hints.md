## Hint 1

No attribute can see two properties at once. This rule is about the *object*, so
it needs something that receives the whole object.

The message the gate checks is exact — copy it from the README.

## Hint 2

```csharp
services.AddOptions<WindowOptions>()
    .BindConfiguration("Dojo:D09:Window")
    .Validate(options => options.End > options.Start, "End must be after Start.");
```

`Validate` takes a predicate over the bound instance and one message, and chains
after the binding.

That message is the entire user interface of this failure — it is what an
operator reads when a deploy goes wrong at 3am. "Validation failed" would be
technically true and useless.

For several such rules, chain several `Validate` calls, or move to a validator
class (ex4).
