## Hint 1

The rule itself is ex3's. The new part is *when* it runs: by default, on first
use — which for a rarely-read option means the first user to reach that code
path finds the problem, in production.

One more call in the chain moves it to host startup.

## Hint 2

```csharp
services.AddOptions<LicenseOptions>()
    .BindConfiguration("Dojo:D09:License")
    .Validate(options => options.Seats > 0, "Seats must be positive.")
    .ValidateOnStart();
```

With `ValidateOnStart`, a bad setting is a failed deploy: the host never becomes
healthy, the rollout halts, and the message is in the startup log where somebody
is already watching.

The precondition is the one this class is built around: **the defaults must be
valid**, or an application with no configuration at all cannot boot. `Seats`
defaults to 5 for exactly that reason.

And when a value genuinely has no safe default, refusing to start is the correct
behaviour rather than a problem to work around.
