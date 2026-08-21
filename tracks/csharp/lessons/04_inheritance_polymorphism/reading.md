# Reading - csharp/04_inheritance_polymorphism

## Notes

**How virtual dispatch actually works.** Every object on the .NET heap carries a
pointer to its type's *method table*. A non-virtual call is compiled to "call
this exact address"; a virtual call is compiled to "look in the object's method
table at slot 4 and call whatever is there". A subclass that overrides a method
puts its own implementation in that slot, so the same call site reaches
different code depending on what it is holding. That one indirection is the
entire mechanism, and it is why `override` costs a pointer hop and `sealed`
sometimes lets the JIT skip it (it can prove there is only one candidate and
inline the call).

**Construction order is base-first.** When you write `new Manager(...)`, the
base constructor body runs before the derived constructor body. Field
initialisers, though, run in the *other* order: a derived class's field
initialisers run before the base constructor. The practical consequence is the
one bug everyone hits once: **never call a virtual method from a constructor.**
The base constructor runs while the derived object is only half-built, and a
virtual call from there lands in the derived override, which then reads fields
that have not been assigned yet. C# will not stop you; a static analyser will
warn you.

**Single inheritance, many interfaces.** A C# class has exactly one base class.
That is a deliberate restriction — multiple inheritance of *implementation*
creates the diamond problem, where two bases both define `Save()` and nobody
can say which one wins. Interfaces (lesson 05) have no implementation to
conflict, so you may have as many as you like. This is the structural reason
that "favour composition over inheritance" is not just style advice: you get
one inheritance slot, so spend it carefully.

**`sealed`, honestly.** It communicates intent ("this is not an extension
point") and occasionally helps the JIT devirtualise a call. It also stops
people mocking your class in tests, which is the usual reason a team regrets
sealing something. The .NET guideline is to seal by default *in libraries you
version publicly*, because unsealing later is easy and sealing later is a
breaking change. In application code, most teams do not bother.

**Where inheritance goes wrong.** The classic failure is inheriting for code
reuse rather than for substitutability. If `Square : Rectangle` and rectangles
have independent `Width` and `Height` setters, then a method that sets width
and expects height to stay put is now broken by every square — the
Liskov substitution principle, in its original example. When the base's
contract does not honestly hold for the derived type, you wanted composition:
hold a rectangle in a field, expose the two members that make sense, and be
free of the rest.

## ex1

`abstract` is the compiler enforcing a design decision. `Shape` has no area
because "a shape" has no formula, and making `Area()` abstract means the
question is answered exactly once per concrete type, never forgotten, never
defaulted to something meaningless like zero. Delete one override and the build
fails with a message naming the member you did not implement — a genuinely
useful failure, at compile time, in the file that is wrong.

The base constructor doing the `Name` assignment is worth noticing separately.
Shared *state* in the base plus abstract *behaviour* in the subclasses is the
shape most healthy hierarchies take. When the base has no state at all and only
abstract members, you have discovered an interface — which is lesson 05.

For the record: comparing `double`s with `==` is normally a mistake, because
0.1 + 0.2 != 0.3. The gate gets away with `12.0` because 3 × 4 is exact in
binary, and rounds the circle's area to four places precisely because pi r² is
not. When you write your own tests over floating point, compare with a
tolerance.

## ex2

`base.MonthlyPay()` is the difference between *extending* behaviour and
*replacing* it, and choosing extension keeps the salary formula in one place.
Copy the division into the override instead and you have created the bug that
appears six months later, when payroll changes to thirteen payments a year and
managers keep getting twelve.

Omit the `base.` and you get infinite recursion, because `MonthlyPay()` inside
`Manager.MonthlyPay` resolves to the method you are inside. The
`StackOverflowException` that results cannot be caught in .NET — the process
dies immediately — which makes it one of the more memorable mistakes available
to you.

The final assertion is the payoff: `Employee asEmployee = manager;` then
`asEmployee.MonthlyPay()` gives 5500. Upcasting changes what the *compiler*
lets you call; it changes nothing about what the object *is*. Every framework
that hands you back a base type — `object`, `Exception`, `IEnumerable<T>` —
relies on this.

## ex3

This is the single most-asked C# inheritance question in interviews, and the
answer worth memorising is one sentence: **`override` is resolved by the
runtime type of the object; `new` is resolved by the compile-time type of the
variable.**

The reason `new` exists at all is versioning. Suppose you write
`class MyList : SomeLibraryList` with a `Sort()` method. Version 2 of the
library adds its own virtual `Sort()`. Without `new`, your method would suddenly
become an override of something you have never seen, and might be called by
library code expecting different semantics. C# makes you say which you meant,
and warns when you say nothing.

In application code, hiding is almost always a bug. The tell is exactly what
the gate demonstrates: the same object gives two different answers depending on
how the caller happened to be holding it, which means behaviour depends on a
detail no one thinks about. If you ever *need* hiding, that is usually a sign
the two methods should have different names.

## ex4

`RenderAll` is the argument for polymorphism in six lines. The alternative —
`if (n is EmailNotification e) ... else if (n is SmsNotification s) ...` —
works, and then someone adds a push notification and the compiler says nothing,
because the `if` chain is still valid code. It just silently does not handle
the new case. Virtual dispatch makes "handle every kind" the compiler's problem
rather than yours.

`IEnumerable<Notification>` as the parameter type is the other habit worth
copying: take the least specific type you can actually use. A method that only
foreaches has no business demanding a `List<T>`, and demanding one means
callers with an array or a LINQ query have to materialise a copy for you.
Lesson 08 covers the interface hierarchy this sits in.

`typeof(SmsNotification).IsSealed` is the gate reaching for reflection, because
a modifier is not observable any other way at runtime. Reflection is how test
frameworks, serialisers and dependency-injection containers work, and seeing it
used once here is enough for now — `07_generics` and the .NET track use it
again.

## challenge

The template method pattern inverts who is in charge. Normally your code calls
the library's; here the base class calls *yours*, at the moments it chooses.
That inversion is the whole point of a framework, and once you recognise it you
will see it everywhere: `ControllerBase` calls your action, xUnit constructs
your test class and calls your `[Fact]`, `BackgroundService` calls your
`ExecuteAsync`.

Making `Render` non-virtual is a real design decision. It says: the *shape* of
a report — header, body, footer, in that order — is not up for negotiation, and
only the content varies. If a subclass could override `Render`, it could omit
the footer, and then "every report has a footer" stops being true and every
consumer needs a null check.

The `abstract` versus `virtual` contrast between `Body()` and `Footer()` is the
other half. `Body()` is abstract because there is no such thing as a default
report body; `Footer()` is virtual because `"-- end --"` is a perfectly good
answer for most reports. Choosing between them per member, rather than making
everything virtual "just in case", is what keeps a base class honest.

## review1

The abstract *property* is the wrinkle here. Properties can be abstract or
virtual exactly like methods — `public abstract int Wheels { get; }` says every
vehicle must be able to answer, and `public override int Wheels => 4;` answers
with an expression body. There is no field anywhere, which is the point: an
abstract property is a question, not storage.

`Describe()` in the base class is the ex4 idea in miniature. It was written
once, it never changed, and it printed "brap" for the motorbike — because the
call to `Sound()` inside it is virtual and the object decided. Code you wrote
before a subclass existed calls into that subclass correctly. That is the
sentence to keep from this whole lesson.

## Further reading

- [Inheritance in C#](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance) — the base/derived relationship, with construction order spelled out.
- [Polymorphism](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/polymorphism) — including the `new` versus `override` section, which is worth reading twice.
- [Abstract and sealed classes and class members](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/abstract-and-sealed-classes-and-class-members) — when each modifier is appropriate.
- [`base` keyword](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/base) — calling base constructors and base implementations.
- [Knowing when to use `override` and `new`](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/knowing-when-to-use-override-and-new-keywords) — Microsoft's own worked comparison, with output.
