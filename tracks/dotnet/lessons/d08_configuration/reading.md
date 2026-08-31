# Reading - dotnet/d08_configuration

## Notes

`IConfiguration` is a **flat dictionary of string keys to string values**, and
almost every confusion about it dissolves once that sentence is believed. The
colons in `Dojo:D08:Site:Title` are part of the key, not navigation. The
"objects" and "arrays" in `appsettings.json` are a convenience for writing keys —
an array is keys named `0`, `1`, `2`, and a nested object is a key with a longer
prefix.

The second idea is **layering**. Several providers — JSON files,
environment-specific JSON, user secrets, environment variables, command line —
are stacked, and a later one wins key by key. That is why a `docker run -e
Dojo__D08__Site__Title=…` overrides a file without the file changing, and why
you cannot *remove* an array element from a later layer, only overwrite it.

The third is that **absence is normal**. `GetSection` never returns null,
`GetValue<T>` has an overload that takes a default, and a missing key is not an
exception. Configuration is the one place in an application where "not there" is
an ordinary answer rather than a bug, which is exactly why d09 exists — some
values really are required, and that has to be said explicitly.

## ex1

Three reads and three conversions. `configuration["path"]` is the raw string or
`null`; `GetValue<int>("path", 10)` parses and falls back in one call.

The classic mistake is `int.Parse(configuration["…"]!)`, which is a
`NullReferenceException` or a `FormatException` waiting for the first deployment
that forgets the key — and it happens at the moment the value is *used*, which
is usually not startup.

Worth remembering the environment-variable spelling: a colon is not legal in an
environment variable name on Linux, so `Dojo__D08__Site__Title` (double
underscore) maps to the same key. That is how the same configuration is written
in a Dockerfile, a Kubernetes manifest and an App Service setting.

## ex2

`GetSection(path).Get<T>()` constructs the object — running its property
initialisers — and then writes **only** the properties it found keys for. That
is why defaults survive a partial section, and it is the single most useful
thing to know about the binder.

The classic mistake is expecting the opposite and "defending" against it by
checking every property for null afterwards. The model answer instead puts the
defaults where they belong, in the class, and lets configuration override what
it wants to.

The one null to handle: `Get<T>()` returns `null` when the section does not
exist at all, so `?? new MailerSettings()` is not paranoia.

## ex3

Arrays are numbered keys, which explains two things people find surprising.
Order is the key order, so `Mirrors:0` comes before `Mirrors:1` whatever the
file looked like. And a later configuration layer overwrites **by index** — it
cannot shorten a list, so a three-element default and a one-element override
leave you with one new value and two stale ones.

The classic mistake here is treating a missing list as an error. An application
with no mirrors configured is a valid application; the model answer coalesces to
an empty list and returns 200.

## ex4

`GetConnectionString(name)` is exactly `GetSection("ConnectionStrings")[name]`,
and it exists because that path is a convention every hosting platform writes
into — Azure App Service, Docker Compose, Aspire, and every CI system's secret
store. Using the convention means an operator can set your connection string
without reading your code.

The 404 is the design decision worth defending: a connection string that is not
configured is not an empty connection string. Returning `""` and letting the
database driver fail three layers down turns a configuration problem into a
mystery.

## ex5

`GetSection` **never returns null** — it hands back an empty section — which is
why there is an `Exists()` method at all. `Exists()` is true when the section has
a value or at least one child.

That design means missing configuration cannot crash you by accident, and it
also means it cannot warn you. Reading a required value with `GetValue<int>` and
no default silently gives you `0`, and `0` is a plausible-looking timeout. The
model answer supplies a default for each value *and* reports whether the section
was there, which is the shape of a real "is this thing configured" health check.

## ex6

`GetChildren()` enumerates a section whose keys your code does not know: feature
flags, per-tenant settings, named clients, rate-limit policies. Each child is
itself an `IConfigurationSection` with a `Key` and a value, so
`child.Get<bool>()` converts properly.

The classic mistake is reading `child.Value` and testing it for
truthiness — `"false"` is a non-empty string, so the feature you switched off
stays on. Conversion is not optional just because the value looks like a
sentence.

The design note: `known` counts every key, not just the enabled ones, because a
feature switched off is still a feature the application knows about. That
distinction is what lets an admin page list flags rather than guess them.

## ex7

One `Get<T>()` call handles an enum, two `TimeSpan`s, a list of objects and a
nested object, and knowing the conversion rules saves writing a parser.

Enums bind **by name, case-insensitively** — and also by number, which is the
sharp edge: `"Mode": "3"` on a two-value enum binds silently to `(FeedMode)3`
and fails much later. `TimeSpan` binds from `"hh:mm:ss"` (and `"d.hh:mm:ss"`),
`DateTime` from ISO-8601, and anything with a `TypeConverter` from its string
form.

Lists of objects bind index-first: `Endpoints:0:Url`, `Endpoints:0:Weight`. And
the defaults rule from ex2 applies **at every depth** — `Retry:Count` was
configured, `Retry:Backoff` was not, and the nested object's own default
survives.

## ex8

The chain — environment-specific, then default, then nothing — is the shape of
almost every real feature-flag or per-tenant override system, and building it
from `IHostEnvironment.EnvironmentName` rather than a literal is what makes it
work in all four environments.

Note the framework does this for you at the *file* level:
`appsettings.json` then `appsettings.{Environment}.json`, layered so the second
wins. Reach for that first. Build an in-configuration chain like this one when
the branching is per-key rather than per-file — a tenant, a region, a rollout
ring — because layering files cannot express "this key, for this tenant".

The `source` field in the response is the part worth stealing. When something is
configured wrongly in production, "what is the value" is half the question;
"where did it come from" is the half that takes an afternoon. Exposing the
provenance — as this endpoint does, or as `IConfigurationRoot.GetDebugView()`
does — turns that afternoon into a request.

## Further reading

- [Configuration in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration) — providers, layering, environment variables and the key spelling rules.
- [Configuration in .NET](https://learn.microsoft.com/en-us/dotnet/core/extensions/configuration) — the flat-dictionary model, `GetSection`, `Exists`, `GetChildren`.
- [Configuration binder](https://learn.microsoft.com/en-us/dotnet/core/extensions/configuration-binder) — `Get<T>`, `Bind`, arrays, nested objects and the type conversions.
- [Use multiple environments](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/environments) — `IHostEnvironment`, `appsettings.{Environment}.json` and how the name is chosen.
- [Integration tests in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests) — `WithWebHostBuilder` and `ConfigureAppConfiguration`, the gate's own trick.
