## Hint 1

The gate counts the messages: three problems must produce three reasons. So
collect failures rather than returning on the first one.

And when it passes, check the other half — a validator class is an ordinary
class, and nothing runs it unless something put it in the container.

## Hint 2

```csharp
var failures = new List<string>();

if (options.Daily < 1) { failures.Add("Daily must be at least 1."); }
if (options.Burst > options.Daily) { failures.Add("Burst must not exceed Daily."); }
if (!Tiers.Contains(options.Tier)) { failures.Add($"Tier '{options.Tier}' is not a tier."); }

return failures.Count > 0
    ? ValidateOptionsResult.Fail(failures)
    : ValidateOptionsResult.Success;
```

`Fail` has an overload taking a collection — that is what makes "every reason at
once" possible.

And the registration:

```csharp
services.AddSingleton<IValidateOptions<QuotaOptions>, QuotaOptionsValidator>();
```

Because it is resolved from the container, a validator like this can take
dependencies — which is the main reason to prefer it over a `Validate` lambda.
