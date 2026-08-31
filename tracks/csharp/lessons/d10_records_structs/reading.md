# Reading - csharp/d10_records_structs

## Notes

Two ideas run through this set, and they are easy to confuse because they often
travel together. The first is **value semantics**: does copying this thing give
me an independent thing, and are two of them with the same contents "the same"?
The second is **immutability**: can it change after it is built? A `record` is a
class with value equality and a copy syntax; a `struct` is a value type that
copies on assignment; `readonly` is what actually stops mutation. You can have
any combination, and picking the wrong one produces a specific, recognisable
bug.

The drills split accordingly. ex1, ex2, ex4 and ex8 are about records - what
the compiler generates, what `with` copies, how inheritance behaves. ex3, ex5,
ex6 and ex7 are about structs - copying, the `default` hole, and what happens
when a mutable one meets an interface.

The rule of thumb worth carrying away is Microsoft's own: make a struct when
the thing is logically a single value, is small, is immutable, and will not be
boxed often. Every failure in ex6 and ex7 is one of those four conditions being
broken.

## ex1

Really testing: knowing what a single line of `record` actually produces - a
constructor, get-only properties, `Equals`, `GetHashCode`, `ToString`,
`Deconstruct`, `==`/`!=` and a copy constructor. The classic mistake is writing
`Print` by hand instead of calling the generated `ToString`, which misses the
point of the exercise; the second is comparing components one by one in
`SamePerson` when `==` already does it. Notice the gate checks `GetHashCode`
agrees for two equal records: that pairing is generated together, which is why
records are safe as dictionary keys and hand-written classes so often are not.

## ex2

Really testing: `with` as a copy-and-change expression, and the fact that
computed members follow the copy automatically. The classic mistake is thinking
`with` mutates - it does not, and the gate checks the original. The deeper
point is what `with` does *not* do: it calls the generated copy constructor,
not your primary constructor's body, so no validation runs. Any invariant has
to live in an `init` accessor or in the method doing the copying. That gap is
the one real weakness of records-as-immutable-data and a very common interview
question.

## ex3

Really testing: a `readonly struct` forcing you to return new instances rather
than mutate. The compiler enforces it, which is exactly why the modifier is
worth writing - it turns a convention into a rule. Two smaller traps live in
`Darken`: byte arithmetic promotes to `int`, so the result must be cast back;
and the clamp must happen *before* the cast, or a negative result wraps round
to a large byte. That is d01 ex8's lesson arriving in a different costume, and
it is the kind of bug that shows up as one weirdly bright pixel.

## ex4

Really testing: record inheritance, which is where records do something a
hand-written class rarely gets right. `with` on a base-typed variable produces
the *derived* type, because the copy constructor is protected and virtual - so
nothing is sliced off, and code that only knows about `Vehicle` cannot
accidentally discard a truck's payload. Equality is the other half: the
generated `Equals` compares a hidden `EqualityContract` (the runtime type)
before comparing components, so a `Vehicle` and a `Truck` holding the same data
are not equal. Getting both of those right by hand is genuinely hard, which is
the argument for the feature.

## ex5

Really testing: `record struct` versus `readonly record struct`, and struct copy
semantics. `BumpWins` mutates its parameter and the caller sees nothing -
write the same method for a class and both change. That difference is the whole
class-or-struct decision in three lines. The `default(Point)` check is a
deliberate set-up for ex6: for a point the zeroed value is meaningful, so
nothing is wrong; knowing which of your structs have a meaningful zero is the
difference between a safe value type and a trap.

## ex6

Really testing: that `default(T)` bypasses every constructor a struct has. A
`readonly struct Currency` looks watertight and still has a reachable state its
own constructor would reject - `default`, `new Currency[10]`, and an
uninitialised field all produce it, with `Code` null. The classic mistake is
assuming validation in a struct's constructor is a guarantee; it is only a
guarantee for instances that went through it. The three answers are to use a
class instead, to design the zero value to be meaningful, or to expose readers
that cope - which is what `IsDefault` and `Safe` do here. This is the standard
objection to "parse, don't validate" wrapper types being structs.

## ex7

Really testing: boxing, and why "make structs immutable" is advice rather than
pedantry. Assigning a struct to an interface-typed variable copies it into a
box on the heap; every subsequent call goes to that box, and the original is
untouched. `ViaCopyThenReadOriginal` returning 0 is the bug in its purest form,
and the line that caused it looks like an ordinary assignment. `ViaArrayElement`
is the counterpoint: an array element is a variable, so the mutation lands. Its
twin - `list[0].Increment()` on a `List<T>` - does not compile at all, because
the indexer returns a copy and C# refuses to let you mutate something about to
be discarded. Three different behaviours from three visually similar lines is
exactly why the guidance is to make the situation impossible.

## ex8

Really testing: that `with` is a **shallow** copy, and positional patterns.
Changing a nested value needs the nested record rebuilt - `person with { Home =
person.Home with { City = city } }` - and the gate checks that a plain
`with { Name = ... }` shares the very same `Address` object. That sharing is
safe here only because `Address` is immutable; with a mutable nested object it
is the classic aliasing bug. The pattern half shows what positional records buy
beyond deconstruction: `Person(_, Address(_, "UK"))` tests two levels without
naming a property, and arms are tried strictly in order - which is why a long
UK name still classifies as "UK".

## Further reading

- [Records](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/record) - everything the compiler generates, including the copy constructor.
- [Structure types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/struct) - `readonly struct`, `record struct`, and the default constructor.
- [`with` expressions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/with-expression) - what is copied and what is not.
- [Choosing between class and struct](https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/choosing-between-class-and-struct) - the four conditions.
- [Boxing and unboxing](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/types/boxing-and-unboxing) - what ex7 is really about.
- [Patterns](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns#positional-pattern) - the positional pattern, in the specification.
