# Reading - csharp/07_generics

## Notes

**Reified generics, and why they matter.** .NET keeps type arguments at
runtime. The JIT compiles a separate machine-code specialisation for each value
type argument — `List<int>` really does store ints inline, with no boxing — and
shares one specialisation among all reference types, since every reference is
the same size. Java, by contrast, *erases* type arguments: `List<String>` and
`List<Integer>` are the same class at runtime, everything is boxed, and you
cannot ask an object what its element type is. The practical consequences in C#
are that `typeof(List<int>) != typeof(List<string>)`, that reflection can
inspect type arguments (which is how ex4's gate works, and how JSON
serialisers and DI containers work), and that generic collections of value
types are genuinely fast.

**Constraints are a contract in both directions.** They tell the compiler what
the body may do with `T`, and they tell callers what types are allowed. Adding
one is a breaking change for callers; removing one is a breaking change for the
body. So the discipline is: add the fewest constraints that let you write the
method. `where T : notnull` in particular is what `Dictionary<TKey, TValue>`
requires of its key, and it is a nullable-annotation constraint rather than a
runtime one.

**Where generic code cannot go.** You cannot constrain to "has a `+` operator"
(before .NET 7), cannot constrain to a specific constructor signature other
than the parameterless one, and cannot write `where T : Enum`... except that
you now can, since C# 7.3. The general shape of the gaps: the CLR's constraint
system is deliberately simple, and generic maths finally filled the biggest
hole by letting interfaces declare `static abstract` members.

**`default(T)` is a trap worth naming.** For a reference type it is `null`, for
a numeric it is `0`, for a `bool` it is `false`, for a struct it is the
all-zero value. So `default(T)` as "no result" is ambiguous exactly when `0` or
`false` is a legitimate result. That is why `FirstOrDefault` has a
`FirstOrDefault(source, defaultValue)` overload now, why the `Try...` pattern
returns a `bool`, and why ex3's `Result<T>` exists.

**Variance in one line each.** Covariance (`out`) preserves the direction of
the type relationship: `IEnumerable<string>` is an `IEnumerable<object>`.
Contravariance (`in`) reverses it: an `Action<object>` is an `Action<string>`.
Invariance is neither, and is the default — `List<string>` is *not* a
`List<object>`, and it must not be, because you could then add an `int` to it.

## ex1

The three methods have no constraints because they need none: they store,
return and count `T`s without asking anything of them. That is the cleanest
case for generics, and it is worth noticing how much you *cannot* do in such a
method — no comparison, no arithmetic, no `null` check that means anything.

`ref` is the other half of ex1. A `ref` parameter is an alias for the caller's
variable, so `Swap` assigns to the caller's storage directly. It is one of
three modifiers in the family: `ref` (read and write), `out` (write only, must
assign), `in` (read only, avoids copying a large struct). C# also requires
`ref` at the *call* site, which is unusual among languages and deliberate:
seeing `Swap(ref a, ref b)` tells a reader that `a` and `b` may change, without
looking up the signature.

The LINQ note in the hints is not a throwaway. `FirstOrDefault` and `Count()`
are exactly these methods, already written, tested and optimised — `Count()`
even checks whether the sequence is secretly an `ICollection<T>` and asks for
its `Count` rather than walking it. Writing them by hand once means the LINQ
version is a shortcut rather than a mystery.

## ex2

Each constraint unlocks precisely one capability, and the exercise is designed
so you feel the lack. Without `IComparable<T>`, `item.CompareTo(best)` does not
compile — because `T` could be a `Random`, and `Random` has no ordering. The
constraint is you telling the compiler which types are allowed, so the compiler
can let you write the body.

The seeding problem in `Max` is a genuine generic-programming difficulty. In
non-generic code you would start `best` at `int.MinValue`; there is no such
value for an arbitrary `T`. The two honest options are a `seenAny` flag or
splitting the first element out with an enumerator (`if (!e.MoveNext()) throw;`),
and LINQ's own `Max` uses the second. Returning `default(T)` for an empty
sequence would be the third, and it is exactly what `Max` deliberately does not
do — because `0` is a plausible maximum and "there wasn't one" is not the same
statement.

`new()` is the weakest constraint in practice, because it only promises a
*parameterless* constructor, and most real types need arguments. That is why
factory *functions* (`Func<T>`, lesson 09) and dependency-injection containers
exist: they express "here is how to make one" without the type having to
support a no-argument construction.

## ex3

`Result<T>` is a small, real design worth carrying with you: it makes "this
might have failed" part of the return *type*, so a caller cannot accidentally
ignore it the way they can ignore an exception they never thought about. Rust
and F# and Go all lean on this pattern; C# is starting to, and every ASP.NET
Core codebase eventually grows one.

The static factory methods (`Ok`, `Fail`) are the other pattern here.
Constructors have a fixed name, so when a type has two meaningfully different
ways to come into existence, factories give each one a name and let you hide the
constructor. `TimeSpan.FromMinutes`, `Task.FromResult` and
`ImmutableArray.Create` are the framework doing the same thing.

The choice to have `Value` throw is the important one, and the reasoning
generalises: **fail where the mistake is, not three method calls later**. A
`Result` that hands back `default(T)` when it failed produces a `0` that means
"no answer" and a `null` that means "no answer", and both of those look exactly
like real data until they cause a wrong number in a report.

## ex4

Variance is where generics stop being obvious, and the way to remember it is by
direction of data flow. If a type only ever *produces* `T`, it is safe to treat
it as producing something more general — hence `out`, hence
`IEnumerable<out T>`. If it only ever *consumes* `T`, it is safe to treat it as
consuming something more specific — hence `in`, hence `Action<in T>` and
`IComparer<in T>`. If it does both, neither is safe, and the type must be
invariant: `List<T>` and `IList<T>` are invariant for exactly this reason.

The compiler enforces the condition at declaration time, which is why you get
an error if you add a `void Accept(T item)` to a covariant interface. That
check is what makes variance sound, and it is what C# arrays lack: `string[]`
is treated as `object[]`, which was a Java-era decision, and the price is a
runtime `ArrayTypeMismatchException` on the store instead of a compile error.
Being able to explain that trade is a solid interview answer.

Note that variance applies only to interfaces and delegates, and only to
reference type arguments. `IEnumerable<int>` is not an `IEnumerable<object>`,
because boxing an `int` changes its representation and the conversion cannot be
a no-op reference reinterpretation.

## challenge

Static abstract interface members are the newest thing in this course.
`INumber<T>` declares `static abstract T Zero { get; }`, so the *type* `T` — not
an instance — must supply it, and `T.Zero` inside your generic method resolves
at compile time to whichever type was substituted. That closes a hole that made
"sum any number" genuinely impossible to express for twenty years; the old
workarounds involved `dynamic`, expression trees, or a switch over `typeof(T)`.

`T.CreateChecked(count)` is the generic conversion. The family is
`CreateChecked` (throws if the value does not fit), `CreateSaturating` (clamps
to the type's range) and `CreateTruncating` (wraps). Being asked to pick one is
the same "what should happen when this cannot be represented?" question that
lesson 01's `SafeAdd` asked, generalised.

Counting and summing in one pass is not premature optimisation. An
`IEnumerable<T>` might be a database query, a file being read, or a generator —
walking it twice can be slow, or wrong, or impossible. That habit is the whole
subject of lesson 10 ex3.

## review1

Both methods are `CompareTo` in a loop, and the review is really checking two
things: that you reach for `CompareTo` rather than `<` when `T` is generic, and
that you translate specification words into the right comparison. "Strictly
greater" is `> 0`; "inclusive" is `>= 0` and `<= 0`. Getting a boundary wrong is
the most common bug in this kind of code, which is why every gate in this
course tests the boundary rather than the middle.

`FirstAbove` returning early is worth a thought too: it stops as soon as it has
an answer, which for a lazy or expensive sequence is the difference between
reading one item and reading a million. LINQ's `First` does the same, and
knowing which operators are lazy and which are greedy is lesson 10.

## Further reading

- [Generics in .NET](https://learn.microsoft.com/en-us/dotnet/standard/generics/) — the overview, including what the runtime does with type arguments.
- [Constraints on type parameters](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters) — every constraint, with what each one permits.
- [Covariance and contravariance](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/) — with the list of variant interfaces and delegates in the BCL.
- [Generic math](https://learn.microsoft.com/en-us/dotnet/standard/generics/math) — `INumber<T>`, static abstract members, and the `Create*` conversions.
- [`default` operator](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/default) — what `default(T)` produces for each kind of type.
