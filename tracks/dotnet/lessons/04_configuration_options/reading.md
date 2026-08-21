# Reading - dotnet/04_configuration_options

Configuration looks like the least interesting subject in ASP.NET Core and is
one of the highest-leverage. Almost every "it works on my machine" incident,
every leaked secret and every deploy that needed a code change to flip a flag
traces back to a decision made here.

## Notes

**One `IConfiguration`, many providers.** `ConfigurationBuilder` holds an
ordered list of `IConfigurationProvider`s, each of which contributes a flat
`IDictionary<string, string>`. Reading a key walks the providers *backwards*
and returns the first hit, which is what "later wins" means mechanically. The
defaults `WebApplication.CreateBuilder` installs are, in order: `appsettings.json`,
`appsettings.{Environment}.json`, user secrets (Development only), environment
variables, command-line arguments. Adding your own — an INI file, a key vault,
a database — is one `builder.Configuration.Add…` call, and nothing downstream
notices.

**Everything is a string, and the hierarchy is fake.** `configuration["a:b:c"]`
is a dictionary lookup on the literal key `"a:b:c"`. `GetSection("a:b")` does
not return a subtree object; it returns a view that prefixes keys. This is why
JSON, INI, environment variables and command-line arguments can all feed the
same system despite having wildly different notions of structure, and why an
array in JSON becomes the keys `Items:0`, `Items:1`, `Items:2`.

**Environment variables use `__`.** `Dojo__Catalog__PageSize=50` sets
`Dojo:Catalog:PageSize`, because colons are illegal in environment-variable
names on some platforms. Every container orchestrator's documentation assumes
you know this.

**Secrets do not go in `appsettings.json`.** That file is committed. Locally,
use `dotnet user-secrets`, which stores JSON in your user profile outside the
repository and is loaded automatically in Development. In production, use
environment variables injected by the platform, or a real secret store (Azure
Key Vault, AWS Secrets Manager) added as a configuration provider — the code
that reads them does not change, which is the whole point of the provider
abstraction.

**Validation belongs at startup, not at first use.** `AddOptions<T>().Bind(…)
.ValidateDataAnnotations().ValidateOnStart()` makes a misconfigured application
fail to start rather than fail on the request that first touches the setting.
"Fail fast, at deploy time, with a message naming the key" is worth a great
deal at three in the morning. (This lesson does not gate it, because a
deliberately broken configuration would stop the whole course app from booting —
but it is the first thing to add in real code.)

**`IOptions` versus `IOptionsSnapshot` versus `IOptionsMonitor`.**
`IOptions<T>` is a singleton computed once; a configuration file edited while
the app runs will not reach it. `IOptionsSnapshot<T>` is scoped and recomputed
per request, so file changes appear on the next request — at the cost of
rebinding on every request, and it cannot be injected into a singleton.
`IOptionsMonitor<T>` is a singleton that tracks changes and exposes
`OnChange`, plus `Get(name)` for named options. Knowing which one to use, and
why `IOptionsSnapshot` in a singleton is a compile-time-legal runtime mistake,
is a standard interview exchange.

## ex1 - binding is name matching, and nothing else

`services.Configure<CatalogOptions>(configuration.GetSection("Dojo:Catalog"))`
registers three things at once: an `IOptions<CatalogOptions>` you can inject, a
`IConfigureOptions<CatalogOptions>` that does the binding lazily on first
access, and a change token so `IOptionsMonitor` can react. Nothing binds at
registration time — which is why a wrong section path is not an error, just an
object full of defaults.

The binder matches **public settable properties** to keys, case-insensitively.
That is the entire algorithm, and its failure modes follow from it: a `readonly`
field is skipped, a property whose name does not match the key is skipped, a
constructor-only record property cannot be written (records *can* be bound if
they have settable properties or a matching constructor, but a positional
record with `init` accessors is a common source of surprise). When a value is
present but unconvertible — `"twenty-five"` for an `int` — the binder throws,
with the key in the message.

The reason to bind at all, rather than read `configuration["Dojo:Catalog:PageSize"]`
where you need it: the class is a *contract*. It can be validated, it can be
injected into a constructor so the dependency is visible, it can be
substituted in a test with `Options.Create(new CatalogOptions { … })`, and it
does not spread magic strings across twenty files.

## ex2 - defaults in code, deltas in configuration

The behaviour you measured — configured `MaxRows` wins, unconfigured `Format`
keeps `"csv"` — falls out of "the binder only writes properties it finds keys
for". It has a big consequence for how you should write options classes: **put
the sensible value in the class**, not in `appsettings.json`. Then a deployment
that says nothing gets a working system, and every line in a real environment's
configuration file is a deliberate deviation you can review.

The opposite habit — defaults in `appsettings.json`, empty class — looks
equivalent and is not. The defaults are now invisible to anyone reading the
class; every environment file has to repeat every key; and forgetting one gives
you `0`, `false` or `null` in production rather than the value everyone
assumed.

`IncludeHeaders` is the pointed case. Its type default is `false`, which is a
perfectly plausible-looking answer, so a missing default here would produce a
report with no header row and no error anywhere. Booleans are where "I forgot
to set a default" hides best.

## ex3 - environments, and what they are actually for

`IHostEnvironment.EnvironmentName` is a string read from `ASPNETCORE_ENVIRONMENT`,
defaulting to `Production` when unset — which is a deliberately safe default,
because the dangerous behaviours are the development ones. `IsDevelopment()`,
`IsStaging()` and `IsProduction()` are convenience methods over an ordinal
comparison, and `IsEnvironment("QA")` handles your own names.

Two things the environment actually decides in a real app. It selects
`appsettings.{Environment}.json`, which is how one binary gets three
configurations. And it gates behaviour that must never reach users: the
developer exception page (which is why an unhandled exception in this course
returns the exception text rather than a bare 500), scope validation in the DI
container, detailed database errors, and Swagger UI.

The habit to avoid is scattering `if (env.IsDevelopment())` through your
business logic. Environment checks belong in `Program.cs`, where they choose
*which components to wire up*; below that, code should depend on configuration
and on services, not on which environment it happens to be in. A handler that
behaves differently in Development is a handler that is not tested in
Production.

## challenge - named options, and the trap in `Get`

Named options exist because one options *class* often has several
*configurations*: two feeds, three payment providers, four HTTP clients with
different timeouts. `services.Configure<FeedOptions>("primary", section)` binds
one; `monitor.Get("primary")` retrieves it. `IOptions<T>.Value` and
`monitor.CurrentValue` are shorthand for the unnamed instance, whose name is
`Options.DefaultName` — the empty string.

The trap is that `Get` is total: every string is a valid name, and an unknown
one returns a freshly constructed `FeedOptions` with your defaults rather than
throwing. That is the right design for the options system — a name with no
configuration is legitimately "all defaults" — and completely wrong for an API
endpoint, where a client asking about a feed that does not exist deserves a
404. Hence asking `configuration.GetSection(...).Exists()` first.

Enumerating `GetSection("Dojo:Feeds").GetChildren()` instead of hard-coding the
two names is the other half. It means adding a third feed is a configuration
change and not a deployment, which is precisely the promise configuration is
supposed to make.

## review1 - the same idea, and a different delivery interface

Binding `Dojo:Mailer` is ex1 and ex2 again, deliberately. What is new is the
parameter type: `IOptionsSnapshot<MailerOptions>` rather than
`IOptions<MailerOptions>`.

`IOptionsSnapshot<T>` is registered as **scoped**, so it is recomputed once per
request and every service inside that request sees the same value even if a
configuration file changes mid-request. That consistency is the real feature;
the "picks up changes without a restart" part is the advertised one. The price
is a rebind per request, and the constraint that it cannot be injected into a
singleton — try it and you get the captive-dependency error from lesson 02, at
startup, in Development.

For a value you would never change without a deployment — this one, honestly —
`IOptions<T>` is the better choice. Knowing why you would ever pick differently
is the point of the exercise.

## Further reading

- [Configuration in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/) — the provider stack, precedence and the environment-variable spelling.
- [The options pattern in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/options) — binding, named options, `IOptionsSnapshot` and `IOptionsMonitor`.
- [Options pattern validation](https://learn.microsoft.com/en-us/dotnet/core/extensions/options#options-validation) — `ValidateDataAnnotations`, custom validators and `ValidateOnStart`.
- [Use multiple environments in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/environments) — `ASPNETCORE_ENVIRONMENT`, per-environment files and what changes in Development.
- [Safe storage of app secrets in development](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets) — `dotnet user-secrets`, and why the connection string does not belong in `appsettings.json`.
