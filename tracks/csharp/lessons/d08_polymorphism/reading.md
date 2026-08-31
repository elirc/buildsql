# Reading - csharp/d08_polymorphism

## Notes

Polymorphism is worth exactly one thing: **the code that uses a hierarchy does
not change when the hierarchy grows.** Every problem in this set is a version
of that claim, and two of them are about the ways it fails.

The shape recurs constantly. A loop over a base-typed collection calling an
abstract member (ex1, ex3, ex6). A framework method calling a virtual one you
overrode (ex2). A dispatch table keyed by data rather than by type (ex8). A
chain where each link decides whether the next one runs (ex7). In none of them
does the calling code contain a list of the subclasses - which is what makes
adding the ninth subclass a one-file change.

The two counter-examples are deliberate. ex4 writes the same logic as a switch
over types and watches it go wrong when a new subclass appears; ex5 uses `is`
on purpose, because a capability that genuinely exists on only some subclasses
is a different situation from behaviour that varies. Knowing which one you are
looking at is the judgement this set is drilling.

## ex1

Really testing: writing the consumer without naming the implementations.
`ExportAll` reads `Extension` and calls `Export`, and that is all it knows. The
classic mistake is a `switch` or an `if (exporter is CsvExporter)` inside the
loop, which reintroduces exactly the coupling the abstract class removed. The
smaller lesson is the empty case: `string.Join` over an empty sequence gives
`""`, so `"[]"` for no rows and `""` for no exporters both fall out without a
branch - operations with a natural identity value delete code.

## ex2

Really testing: that `ToString` is virtual on `object`, so overriding it hands
your formatting to every piece of framework code at once - interpolation,
`string.Join`, `Console.WriteLine`, the debugger. The classic mistake is
writing a `Format()` method of your own and then calling it explicitly
everywhere, which works and buys nothing. `abstract override string ToString()`
on the base is a nice touch worth knowing: it removes `object`'s default so a
subclass author cannot forget. And the object-typed assertion in the gate
exists to show the dispatch is real - the compiler is not resolving it from the
static type.

## ex3

Really testing: an ordered fold over interchangeable steps, which is the same
shape as `Aggregate`, a middleware chain, and every data pipeline you will
write. The classic mistake is applying every adjustment to the *original*
amount and summing the differences, which gives a different answer as soon as
two percentages are involved - hence the gate running the same two steps in
both orders and expecting different results. The empty case needs no branch,
because a loop that does not run leaves the accumulator alone. `Math.Floor`
versus `Math.Truncate` is a free bonus: identical for positives, different for
negatives, and knowing which you meant is the kind of detail reviewers notice.

## ex4

Really testing: the trade-off between virtual dispatch and a type switch, which
is the expression problem in miniature. The switch is not wrong - for a closed
hierarchy you own (tokens, an AST, a state enum) it is often clearer than
scattering the logic across subclasses, and C#'s patterns make it pleasant. Its
cost is that every new subclass is a latent bug in every switch somebody forgot
to update, and the compiler cannot help because the discard arm is always
reachable. The rule of thumb: stable types with growing operations - switch;
stable operations with growing types - virtual members.

## ex5

Really testing: the legitimate use of a runtime type test. `Run` is virtual
because both kinds do it; `MaxRetries` needs `is` because it genuinely exists
on only one subclass. The classic mistake is `job.GetType() == typeof(RetryableJob)`
plus a cast, which is longer and *false* for anything derived from
`RetryableJob` - `is` handles that correctly and gives you the converted
variable in the same breath. The design tell-tale worth carrying: if the
special cases in `Describe` reached three or four, the right move would be a
virtual `DescribeSuffix()` returning `""` by default.

## ex6

Really testing: a uniform signature as the thing that makes objects
interchangeable. Every rule is `string? Check(string)`, so a caller can hold a
list of them and know nothing else. The interesting wrinkle is the two
different "nothing" values - `null` from a rule, `""` from the collection - and
the fact that mixing them up is the classic bug here. The other lesson is
single responsibility at the smallest possible scale: `DigitsOnly` passes empty
text vacuously *because* "is anything there?" is `NotBlank`'s job, and rules
that each do one thing are the rules that compose.

## ex7

Really testing: a chain where each link controls whether the next one runs -
and, crucially, that there are two halves to every link. `UpperMiddleware`
changes the request on the way *down*; `TagMiddleware` changes the answer on
the way *back up*. `BlockMiddleware` short-circuits by returning without
calling `Continue`, and the links above it still run their return half, which
is why `"bad news"` comes back as `"<BLOCKED>"` rather than `"BLOCKED"`. This
is exactly ASP.NET Core's pipeline, and tracing it by hand once is the fastest
way to stop being confused by it.

## ex8

Really testing: dispatch by *data* rather than by type - a dictionary of
polymorphic handlers, which is how every plugin system, command bus and route
table works. The classic mistake in `Run` is `Split(' ')`, which shatters the
argument; splitting at the first space only is what keeps `"hello world"`
intact. `HelpCommand` holding a reference to its own registry is the deliberate
twist: a plugin that can answer questions about its neighbours needs the
registry to expose them, and `Names` sorts explicitly because `Dictionary`
promises no order and the order it happens to produce will change one day.

## Further reading

- [Polymorphism](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/polymorphism) - virtual dispatch, from the top.
- [`Object.ToString`](https://learn.microsoft.com/en-us/dotnet/api/system.object.tostring) - the contract and the guidance for overriding it.
- [Type-testing operators and cast expressions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/type-testing-and-cast) - `is`, `as`, and the declaration pattern.
- [Pattern matching](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/functional/pattern-matching) - what ex4's switch is doing.
- [ASP.NET Core middleware](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/) - ex7's pattern, in production.
- [Liskov substitution principle](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/architectural-principles) - why a subclass must be usable wherever the base is.
