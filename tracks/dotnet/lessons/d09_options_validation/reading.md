# Reading - dotnet/d09_options_validation

## Notes

The options pattern is three ideas wearing one name. **Binding** turns a
configuration section into a typed object. **Validation** decides whether that
object is usable. **Lifetime** decides when either of those happens, and it is
the part people skip.

`IOptions<T>` is a singleton, built once, on first use. `IOptionsSnapshot<T>` is
scoped and re-binds per request. `IOptionsMonitor<T>` is a singleton that tracks
changes and can be injected into other singletons. Which one you take is a
statement about how often the values may change underneath you.

The thread that runs through all eight problems: **configuration is input, and
input is validated at the boundary**. A missing bucket name, a port of 70000, an
end time before a start time — these are not exotic; they are the ordinary
result of a deploy script with a typo, and the only question is whether you find
out at startup, at first request, or in a bug report.

## ex1

`AddOptions<T>().BindConfiguration(path)` binds a section by path, resolving
`IConfiguration` from the container when it does. `services.Configure<T>(
configuration.GetSection(path))` is the older spelling of the same thing and is
just as good.

The failure worth noticing is the silent one: `IOptions<T>` **always resolves**,
even when nothing was bound, and hands back a default-constructed object. A
blank bucket name is the only symptom, and it will not look like a
configuration bug when you meet it in production.

Class defaults survive a partial section, exactly as in d08 ex2 — the binder
writes what it found and leaves the rest.

## ex2

Attributes on their own do nothing. `ValidateDataAnnotations()` is what makes
`[Required]` and `[Range]` run, and forgetting it is the classic mistake — the
code *looks* validated, and a 200 with an empty host is the only clue.

When it does run, the failure arrives as an `OptionsValidationException` on the
first `.Value`, carrying a `Failures` collection. That timing matters: it is not
at startup unless you ask (ex7), so a rarely-used option can sit broken for
weeks.

Note `[Required]` on a `string` rejects `""` by default, which is what you want
for configuration — a key present and empty is the same as absent.

## ex3

Some rules are about the *object*, not a property: an end after a start, a
maximum above a minimum, a retry count that makes sense against a timeout. No
attribute can see two properties at once, and `.Validate(predicate, message)` is
the escape hatch.

The message is the whole user interface of this failure. It is what an operator
reads at 3am, so "End must be after Start." beats "Validation failed" by more
than it looks.

The limit worth knowing: `Validate` gives you exactly one message per call. Add
several `Validate` calls for several rules, or move to a validator class.

## ex4

`IValidateOptions<T>` is the full version: a class, resolvable from the
container so it can take dependencies, and able to return **every** failure at
once via `ValidateOptionsResult.Fail(collection)`.

That last part is the real lesson. An operator who fixes one setting, redeploys,
waits for the pipeline and then discovers the next problem has had a bad
afternoon — and it was avoidable, because you knew about all three the first
time.

The classic mistake is writing the validator and never registering it. It is a
plain class; nothing runs it unless it is in the container.

## ex5

Named options let one class serve several configured instances — `primary` and
`backup` feeds, per-tenant settings, several named HTTP clients. Each name binds
separately **and validates separately**, which is why the gate can have one feed
healthy and the other refusing.

The sharp edge is `Get(name)`: it does **not** throw for a name nobody
registered. It builds an unbound instance with default values and hands it over
happily, so an endpoint that takes the name from a client has to know which
names exist. That check is the difference between a 404 and a confidently wrong
answer.

`IOptionsSnapshot<T>` is the scoped one, which is what makes it safe to
re-evaluate per request; `IOptionsMonitor<T>.Get(name)` is the singleton-safe
equivalent.

## ex6

The order is: every `Configure`, then every binding, then every `PostConfigure`,
then validation. `PostConfigure` is therefore the only place that can see the
final state — which makes it the right home for defaults that depend on other
values, and for derived fields like a full path.

The model answer *fills in* rather than overwrites: a configured file name
survives. A `PostConfigure` that assigns unconditionally silently takes the
operator's setting away, which is a genuinely confusing bug to be on the
receiving end of.

`PostConfigureAll<T>` does the same for every named instance at once.

## ex7

Without `ValidateOnStart()`, validation happens on first `.Value` — which for a
rarely-used option means the first *user* to hit that code path finds the
problem, in production, possibly weeks after the deploy.

`ValidateOnStart()` moves it to host startup, so a bad setting is a failed
deploy instead: the container never becomes healthy, the rollout halts, and the
message is in the startup log where someone is already looking.

The condition for using it is the one this exercise builds in: **the defaults
must be valid**, or an application with no configuration at all cannot start. If
a value genuinely has no safe default, that is the point — you *want* it to
refuse.

## ex8

Everything in one chain, and the thing to take away is that each link is opt-in.
`BindConfiguration` does not imply `ValidateDataAnnotations`;
`ValidateDataAnnotations` does not imply your `Validate` predicate; neither
implies `ValidateOnStart`. Four separate decisions, four separate calls.

The ordering inside the pipeline is what makes `Label` work: `PostConfigure`
runs before validation, so the derived value exists by the time the rules look at
the object — and a rule could validate the derived value too.

In a real service this whole block lives next to the class it configures, often
as an extension method (`services.AddPipelineOptions(configuration)`), so the
composition root reads as a list of features rather than a list of framework
calls.

## Further reading

- [Options pattern in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/options) — `IOptions`, `IOptionsSnapshot`, `IOptionsMonitor` and named options.
- [Options pattern in .NET](https://learn.microsoft.com/en-us/dotnet/core/extensions/options) — binding, `PostConfigure`, and the order the pipeline runs in.
- [Options validation](https://learn.microsoft.com/en-us/dotnet/core/extensions/options-library-authors#options-validation) — data annotations, `Validate`, `IValidateOptions<T>` and `ValidateOnStart`.
- [Configuration in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration) — where the sections these options bind to come from.
