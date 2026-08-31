# Reading - csharp/d07_inheritance

## Notes

Inheritance is two separate mechanisms wearing one keyword, and most confusion
about it comes from mixing them up. The first is **code reuse**: a derived
class gets the base class's fields and methods. The second is **virtual
dispatch**: a call through a base-typed reference lands on the most derived
override. The first is a convenience; the second is the one that changes how
you design.

The pattern uniting these eight problems is that **the base class defines the
shape and the derived class fills in the holes**. `Announce` calls the abstract
`Play`; `Render` reads the abstract `Severity`; `Envelope` reads the abstract
`Channel`; `ToText` reads the abstract `Symbol`. In every case the base class
was written before any subclass existed, and adding a new subclass changes
nothing that already works.

Three of the problems are about the sharp edges: what `new` really does when
you cannot override, what `protected` commits you to, and what a virtual call
from a constructor sees. Each has caused real production bugs, and each is
invisible until you have watched it happen once.

## ex1

Really testing: that a derived constructor must feed the base one. The classic
mistake is trying to assign a base class's get-only property from the derived
constructor's body, which does not compile - `: base(...)` is the only route.
The second is forgetting `: base("drum")` on a constructor with an empty body,
because C# then implicitly calls the base's *parameterless* constructor, which
`Instrument` does not have. Notice that `Announce` is not virtual and still
behaves differently per subclass: a non-virtual method calling a virtual one is
the template-method shape, and it is the most useful thing a base class can do.

## ex2

Really testing: `base.Method()`, and the direction the layers compose in.
`base` is resolved at compile time and always means "one step up from the class
this code is written in" - it does not follow the runtime type, which is what
stops `base.Format` from recursing forever. The classic mistake is predicting
`"[t] HI"` for the shouting logger: the shouting layer is *outside*, so it
upper-cases the stamp too. Getting the composition order right on paper before
running the test is the actual exercise; the code is two lines.

## ex3

Really testing: the design choice `abstract` versus `virtual`. Abstract says
"there is no defensible default" and makes the compiler demand an answer;
virtual says "here is a default, replace it if you like". The classic mistake
is making everything virtual, which looks flexible and is not: a virtual member
with a default nobody should use is a bug waiting for a subclass author to
forget it. `InfoAlert` deliberately leaves `Priority` alone, so the gate can
check the default really is inherited rather than restated.

## ex4

Really testing: the difference between overriding and hiding. `sealed override`
fills in the virtual slot and then closes it, which the JIT can use to
devirtualise calls - a real (if usually small) performance argument, and a
strong design argument: it says "this behaviour is now fixed". `new` does not
fill a slot at all; it declares a second, unrelated member with the same name,
and which one you get depends on the *static* type of the reference. That is
the bug: the same object answers `"strobe"` through a `Strobe` variable and
`"beacon"` through a `Signal` variable. The compiler's CS0108 warning is the
only thing standing between you and that, and writing `new` silences the
warning without improving the design - it only records that you meant it.

## ex5

Really testing: `protected` as a second public API. The classic mistake is a
protected *field* rather than protected methods: `AuditedStock` could then
write `_units = -50` and every rule in `Stock` becomes advisory. The second
mistake is in `Ship`, which must read `Decrease`'s bool rather than assuming
the call worked - otherwise the movement counter climbs on refused shipments
and the audit trail lies. The general principle: every protected member is a
promise to subclasses you have never seen and cannot test, so the smallest
useful protected surface is the right one.

## ex6

Really testing: the initialisation order, and the trap it creates. For
`new Panel("Home")` the order is derived field initialisers, then base field
initialisers, then the base constructor body, then the derived constructor
body. So a virtual call from the base constructor lands on the derived override
*before* the derived constructor has run - and any field that override reads is
still at its default. In C# this is merely wrong; in C++ the same code calls
the base version instead, which is a different kind of surprise. The three ways
out are to make the method non-virtual, seal the class, or move the call into
an initialisation method the caller invokes afterwards.

## ex7

Really testing: that overrides compose one step at a time, and that an override
is inherited like any other member. `UrgentEmailMessage` does not restate
`Channel` because `EmailMessage` already overrode it - restating it would be
duplication that can drift. The classic mistake in a three-level chain is
calling the *top* implementation from the bottom, either by copying the base's
body or by expecting `base.Envelope()` to skip a level; it cannot. The other
thing worth noticing is that `Message.Envelope` reads an abstract member, so
the base class calls into a subclass without knowing anything about it.

## ex8

Really testing: the composite pattern - a hierarchy whose nodes hold other
nodes typed as the base class. Every method is one line, and the absence of any
`if` or type test is the point: `Add` never asks what kind its children are, so
adding `Subtract` later means writing one class and touching nothing else. The
second lesson is where the shared code went: `ToText` and `NodeCount` are
identical for every binary operator, so they live once in the middle class,
and only `Symbol` and `Evaluate` vary. Finding that line - what is shared, what
varies - is most of what designing a hierarchy consists of. And note that the
tree structure *is* the operator precedence; there is no precedence code
anywhere.

## Further reading

- [Inheritance in C#](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance) - the basics, with the derived-constructor rules.
- [`abstract`](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/abstract) and [`virtual`](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/virtual) - when the compiler demands an answer.
- [Knowing when to use `override` and `new`](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/knowing-when-to-use-override-and-new-keywords) - the exact case ex4 builds.
- [`sealed`](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/sealed) - on classes and on individual overrides.
- [Access modifiers](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/access-modifiers) - what `protected` actually opens up.
- [CA2214: do not call overridable methods in constructors](https://learn.microsoft.com/en-us/dotnet/fundamentals/code-analysis/quality-rules/ca2214) - the analyser for ex6's trap.
