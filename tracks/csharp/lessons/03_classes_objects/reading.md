# Reading - csharp/03_classes_objects

## Notes

**Why properties, when a public field is shorter?** Three reasons, in the order
they will bite you. First, binary compatibility: a property is a method call, so
changing `public int Count;` to `public int Count { get; set; }` later is a
*breaking change* for anything compiled against the old version, while changing
the body of a property is not. Second, interception: validation, lazy loading,
change notification and logging all need a method, and if there was never one
you cannot add it without touching every caller. Third, everything in .NET that
reflects over your objects — serialisers, data binding, ORMs like EF Core,
model binders in ASP.NET — looks for properties and ignores fields. The
convention is so strong that a public field in a code review reads as a
mistake, even when it would have worked.

**Auto-properties are a compiler trick.** `public int Count { get; private set; }`
generates a hidden backing field plus two tiny methods, which the JIT inlines
away, so the runtime cost is zero. That is why the idiomatic style is to start
with an auto-property and only write a full property body when you need one, as
ex4 did.

**Constructors, and the default you lose.** A class with no declared
constructor gets a public parameterless one. Declare any constructor and that
default disappears — deliberately, because "you must supply an owner" is
usually the rule you were trying to express. If you want both, declare both.
Constructor chaining with `: this(...)` lets one forward to another so the real
initialisation lives in one place.

**Static is global state wearing a namespace.** The `Robot.Built` counter in ex3
is shared by every robot in the process, which is exactly what the exercise
wanted and exactly what makes static state dangerous elsewhere: it is invisible
at the call site, it survives between tests (which is why the gate calls
`Reset()` first), and it is not thread-safe unless you make it so. The two
places static is unambiguously right: pure functions with no state at all
(`Math.Max`, your `Conversions` class from lesson 01), and constants.
Everything in between deserves a second look, and "I need one of these
globally" is usually dependency injection's job — the whole subject of the
.NET track's lesson 02.

**`readonly` versus `const`.** `const` is compile-time and baked into callers
(same versioning trap as optional arguments); `readonly` is assigned at
construction and fixed afterwards. `Thermostat.Minimum` is `const` because 5 is
5 forever. A `readonly` field is what you want for anything computed once per
object — `private readonly List<CartItem> _items = new();` in the challenge
means the *reference* cannot be repointed, though the list it points at is
still mutable. That distinction catches people: `readonly` protects the arrow,
not the object at the end of it.

## ex1

Two failures, two different mechanisms, and choosing between them is a genuine
design decision you will be asked to defend. The rule most teams use:
**exceptions are for situations the caller could not reasonably have
anticipated or handled**. An overdraft is anticipated — the caller is a cash
machine, and "insufficient funds" is a screen it already has. A negative
deposit is a programming error, and the loud failure is a service to whoever
wrote it.

The other half of ex1 is the ordering inside `Withdraw`. Checking before
mutating means the object is never observably in an illegal state. That matters
more than it looks: if a later version of this class raises an event, writes to
a log, or is read by another thread, "briefly negative" becomes "visibly
negative to someone". Getting into the habit of computing the new state, then
committing it, is what makes concurrent and transactional code possible later.

The interview follow-up here is usually "how would you make this thread-safe?"
The honest answer is that `Balance += amount` is three operations (read, add,
write) and two threads can interleave them; a `lock` around the mutation, or an
immutable design where every operation returns a new account, are the two
standard answers.

## ex2

`init` accessors solved a real problem. Before them you either wrote a
constructor with a long positional parameter list — where `new Card("07", 4, true)`
tells the reader nothing — or you used a settable property and gave up
immutability forever. `init` gives you the readable initialiser syntax *and*
the guarantee that nothing changes afterwards, and `required` restores the
constructor's other guarantee: that the caller cannot forget one.

Computed properties are the second idea. `TotalExercises` could have been a
field set by the constructor, and then it would be a second copy of the truth,
free to drift out of sync the moment anything changed. Deriving it means it
cannot be wrong. The trade is cost: a computed property runs its body on every
read, so a property that does real work (a database call, a sort of ten
thousand items) is a trap for callers who reasonably assume property access is
cheap. The convention: properties are for things that are cheap and
side-effect-free; anything else should be a method with a verb in its name.

## ex3

Instance state and static state in the same constructor is the clearest way to
see the difference. `Built++` reaches for one variable that the type owns;
`Serial = Built` writes into this object's own storage. Reset afterwards and
the shared number changes while every robot keeps what it was given, because
they were copies made at construction time, not live views.

Two production notes. First, this counter is a textbook race condition:
`Built++` reads, adds and writes, so two threads can both read 7 and both
become robot 8. `Interlocked.Increment(ref _built)` is the standard fix and the
standard interview answer. Second, static mutable state and tests are natural
enemies — your gate has to call `Reset()` first precisely because a previous
test could have left the counter anywhere. When a test needs to reset global
state, that is the design telling you something.

## ex4

The `value` keyword inside a setter is the incoming assignment, and the fact
that a property can *change* it on the way in is what makes properties more
than syntax sugar. Clamping was chosen over throwing to make the point that a
setter is a policy: this thermostat's policy is "I will do my best with what
you asked for". A different class might reject, log, or raise an event instead.

`Math.Clamp` exists so you do not write `Math.Max(low, Math.Min(high, value))`
and get the nesting backwards, which everybody does once.

`Fahrenheit` demonstrates the other half of the lesson: some state should never
be stored. If both `Celsius` and `Fahrenheit` had setters, someone would
eventually set one and not the other, and the object would hold two
contradictory truths. Derive the second from the first and that bug cannot be
written. The integer-division trap (`21 * 9 / 5` is 37, not 37.8) is the same
"where does the arithmetic happen" question as lesson 01 ex2, in new clothes.

## challenge

The `Items` trap is real and common. `IReadOnlyList<T>` documents an intention;
it does not enforce one, because the concrete `List<T>` you returned still
implements `IList<T>` and a determined caller can cast to it. Whether that
matters depends on the room — inside one team, the interface is a clear enough
signal; across a public API boundary, it is not. `AsReadOnly()` gives you the
enforcement for the price of one wrapper object.

The `Add` merge is the other lesson: **the class decides what its state means**.
Two lines for the same product is a representation the rest of the cart would
have to keep handling forever — `Total` would still work, `Remove` would only
remove one of them, and a UI would show the item twice. Normalising on the way
in, at the one place that can, is why `Add` is a method and not a public list.
The SQL analogy is exact: this is a unique constraint on the product name,
enforced by the only code that can insert.

A note on the `internal set` on `CartItem.Quantity`: it lets the cart update a
line it owns while keeping the setter out of the public API. `internal` means
"anything in this assembly", which is a blunter tool than you would like — it
is the pragmatic C# answer to a genuine gap in the language's access model.

## review1

Three of the lesson's ideas in one small class, and the one that decays fastest
is the ordering in the constructor plus the exact boundary of the guard. Zero
points is legal; minus one is not. If you guarded with `<= 0` and the gate told
you so, that is the review doing its job — boundary conditions are the most
forgettable part of any specification, which is why they are the most valuable
thing to write a test for.

Notice the `Reset()` at the top of the review gate, for the same reason as ex3.
When you see a test that has to reset something before it can run, you are
looking at shared mutable state, and you now know both why it is there and what
it costs.

## Further reading

- [Classes (C# programming guide)](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/classes) — declaring, instantiating, and what reference semantics mean for objects.
- [Properties](https://learn.microsoft.com/en-us/dotnet/csharp/properties) — auto-properties, `init`, expression-bodied accessors, and `value`.
- [Constructors](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/constructors) — including chaining with `: this(...)` and the default you lose.
- [Static classes and static members](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/static-classes-and-static-class-members) — what static actually means and when it is appropriate.
- [Access modifiers](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/access-modifiers) — the full table, including `protected internal` and `private protected`.
- [`required` members](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/required) — the compiler check behind `required string Slug`.
