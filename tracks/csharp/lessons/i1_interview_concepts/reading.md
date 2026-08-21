# Reading - csharp/i1_interview_concepts

## Notes

This page is a question bank, not an essay. Sixty questions, grouped by topic,
each with the answer a strong candidate would actually give — three to six
sentences, one concrete example, and the follow-up question named so the second
one does not surprise you. Stars are frequency, not difficulty: [*] comes up
occasionally, [**] comes up often, [***] you should expect in any C# interview.
Each answer says which lesson to redo if it did not come out fluently.

Work it by covering the answer, saying yours out loud, and only then reading
on. Recognition is not recall, and the gap between them is exactly what an
interview measures.

## The question bank

### Value types and reference types

**Q1. What is the difference between a value type and a reference type?** [***]

A value type holds its data directly; a reference type holds a reference to an
object stored elsewhere. So assignment, argument passing and reading from a
collection all copy the whole value for a struct, and copy only the arrow for a
class. `int`, `double`, `bool`, every `enum` and every `struct` are value types;
`string`, arrays, every `class`, every interface and every delegate are
reference types. The practical consequence: give a method a `List<int>` and it
can change your list, give it an `int` and it cannot change your number.
*Follow-up: "so where do they live?" (Q2). Weak here -> redo `01_types_variables`.*

**Q2. Where do value types live — stack or heap?** [***]

The honest answer is "wherever the variable lives". A local of value type lives
in the stack frame; a *field* of value type lives inside its containing object,
which for a class is on the heap. An `int[]` of a million elements is one heap
object with a million inline ints. The stack/heap shorthand is a useful first
approximation and wrong often enough to be worth correcting — and saying that
out loud demonstrates you know the difference between a model and a rule.
*Follow-up: "what about a struct captured by a lambda?" (it gets hoisted onto
the heap in the closure object). Weak here -> redo `01_types_variables`.*

**Q3. When would you write a `struct` instead of a `class`?** [**]

When the thing is logically a single value, is small (Microsoft's guidance is
about 16 bytes), is immutable, and will not be boxed often — a point, a money
amount, a date. Everything with identity or a lifecycle is a class. The reason
for the size limit is that copying is the default operation, so a large struct
is copied a lot; the reason for immutability is that copies make mutation
confusing. In practice most application types are classes, and structs earn
their place in hot paths and small value-like types.
*Follow-up: "why is a mutable struct a problem?" (Q4). Weak here -> redo
`06_structs_records`.*

**Q4. What is wrong with a mutable struct?** [**]

Because every assignment copies, a mutation often lands on a copy you did not
realise you had. The classic demonstration is a `List<MyStruct>`: `list[0]`
returns a copy, so `list[0].Value = 5` does not even compile — the compiler
knows the write would be discarded. An array behaves differently
(`array[0].Value = 5` works, because array indexing gives a real reference), so
the same line means different things in two containers. `readonly struct`
removes the whole category.
*Follow-up: "why does the array version work?" Weak here -> redo
`06_structs_records`.*

**Q5. What does `readonly struct` guarantee?** [*]

That no member can mutate the instance, which the compiler enforces on every
field and property. It also lets the compiler stop making defensive copies when
you call members through a `readonly` field or an `in` parameter — passing a
non-readonly struct as `in` makes a hidden copy on every member call, which is
a real performance surprise. Use it for any struct you write.
*Follow-up: "what is `ref struct` for?" (stack-only types like `Span<T>`).
Weak here -> redo `06_structs_records`.*

**Q6. Can a struct have a parameterless constructor?** [*]

Since C# 10, yes — but `default(MyStruct)` and `new MyStruct[10]` still produce
the all-zero value without calling it, so a struct can always exist in a state
your constructor never sanctioned. That is why "a struct cannot enforce
invariants the way a class can" is still true, and why validation belongs
somewhere that runs on every path.
*Follow-up: "so how do you make an invalid struct impossible?" (you cannot;
you design so the zero value is meaningful). Weak here -> redo
`06_structs_records`.*

### Boxing

**Q7. What is boxing?** [***]

Wrapping a value type in a heap-allocated object so it can be treated as an
`object` or as an interface. `object o = 42;` allocates a box and copies the 42
into it; casting back (`(int)o`) unboxes with a type check. It matters because
it is an allocation and a copy in code that looks free — in a tight loop it
shows up in a profiler immediately.
*Follow-up: "name three places boxing happens by accident" (Q8). Weak here ->
redo `06_structs_records` reading.*

**Q8. Where does boxing happen without you writing a cast?** [**]

Assigning a struct to an `object` or interface variable; calling a
non-overridden `object` method on a struct (`ToString`, `Equals`,
`GetHashCode`) via the base implementation; putting value types in a
non-generic collection like `ArrayList`; and old-style `string.Format`
arguments, which take `object`. Generics avoid it because `List<int>` really
does store ints — that was the whole point of generics in C# 2.
*Follow-up: "does a generic constraint stop the boxing of an interface call?"
(yes, a constrained call on `where T : IComparable<T>` does not box). Weak here
-> redo `07_generics`.*

**Q9. Does mutating a boxed value change the original?** [*]

No. The box holds a copy, so the original and the box are independent from the
moment of boxing. This is exactly `i1`'s ex2, and it is the mechanism behind
the surprise that unboxing gives you the *old* value after you have changed the
variable.
*Follow-up: "and what about unboxing to a variable and mutating that?" (another
copy). Weak here -> redo `i1` ex2.*

**Q10. How does boxing interact with `Equals` on a struct?** [*]

`ValueType.Equals` — the default for any struct that does not override it —
compares field by field, and for structs containing reference fields it does so
via reflection, which is slow. It also boxes the argument, because the
signature takes `object`. Any struct used as a dictionary key or compared in a
loop should override `Equals` and `GetHashCode`, or be a `record struct`, which
generates fast ones.
*Follow-up: "how much slower?" (an order of magnitude is typical). Weak here ->
redo `06_structs_records`.*

### Strings

**Q11. Is `string` a value type or a reference type?** [***]

A reference type that is immutable, which makes it *behave* like a value in the
ways you notice — nobody can change your string behind your back — while
copying like a reference, so assigning is cheap regardless of length. `==` was
overloaded to compare text, which is why it feels like a primitive. That
combination is deliberate and is the source of most string interview questions.
*Follow-up: "so what does `ReferenceEquals` on two equal strings say?" (depends
on interning — Q13). Weak here -> redo `01_types_variables`.*

**Q12. What does string immutability cost, and what do you do about it?** [**]

Every "modification" allocates a new string, so `result += x` in a loop
allocates once per iteration and copies everything each time — quadratic work
and quadratic garbage. `StringBuilder` keeps a mutable buffer and produces the
final string once; `string.Join` and `string.Concat` do the efficient thing for
their shapes. For a handful of items it does not matter; for thousands it is
the difference between instant and visibly slow.
*Follow-up: "at what size do you switch?" (there is no clean number — switch
when the count is unbounded or driven by data). Weak here -> redo
`08_collections` reading.*

**Q13. What is string interning?** [*]

The runtime keeps a pool of string literals, so every occurrence of `"hello"`
in your program refers to one object. Strings built at runtime are not interned
unless you call `string.Intern`. That is why `ReferenceEquals("hello", "hello")`
is true and `ReferenceEquals("hello", new string(...))` is false, and why
comparing strings with `ReferenceEquals` is a bug that passes its first test.
*Follow-up: "why is interning not free?" (interned strings live for the life of
the process). Weak here -> redo `i1` ex1.*

**Q14. How should you compare strings?** [**]

`==` for ordinary text equality — it is ordinal and correct. For anything
culture-sensitive, or case-insensitive comparison, pass a `StringComparison`
explicitly: `string.Equals(a, b, StringComparison.OrdinalIgnoreCase)` for
identifiers and keys, `StringComparison.CurrentCulture` for text a human sorts.
The rule: ordinal for machine data, culture for human data, and never
`ToLower()` for comparison — it allocates and gets Turkish wrong.
*Follow-up: "what is the Turkish-i problem?" (`"I".ToLower()` is not `"i"` in
tr-TR). Weak here -> redo `02_control_flow_methods` reading.*

### Equality

**Q15. What is the difference between `==` and `.Equals()`?** [***]

`==` is a static operator resolved at compile time from the *static* types of
the operands; `Equals` is a virtual method dispatched at run time on the actual
object. So for two variables typed `object` holding boxed `5`s, `==` is
reference comparison and false, while `.Equals` reaches `Int32.Equals` and is
true. For `string`, `==` was overloaded to compare text; for most reference
types it is not, and compares references.
*Follow-up: "what does that mean for a generic method comparing two `T`s?" (use
`EqualityComparer<T>.Default`, not `==`). Weak here -> redo `i1` ex1.*

**Q16. What is the `Equals`/`GetHashCode` contract?** [***]

Objects that are equal must return the same hash code. Unequal objects may
collide — that is normal and handled by the comparison step. And a hash code
must not change while the object is in use as a key. Break the first rule and a
`Dictionary` puts an entry in one bucket and looks for it in another, so a
lookup you know should succeed fails; break the third and an entry gets
stranded when you mutate the key.
*Follow-up: "how would you implement `GetHashCode`?" (`HashCode.Combine(a, b)`,
never XOR of fields). Weak here -> redo `06_structs_records` ex4.*

**Q17. Why should a hash key be immutable?** [**]

Because the dictionary computed the bucket from the hash at insert time. Mutate
a property that feeds the hash and the object now hashes elsewhere: the entry is
unreachable by lookup, still occupies a slot, and enumerating the dictionary
still shows it. That "ghost entry" is one of the more baffling bugs in .NET,
and immutable keys make it impossible.
*Follow-up: "what does a `record` do about this?" (nothing automatic — a record
with mutable properties has the same problem). Weak here -> redo
`06_structs_records`.*

**Q18. What does `record` give you for equality?** [**]

A generated `Equals`, `GetHashCode`, `==` and `!=` that compare member by
member, plus `IEquatable<T>`. Each member is compared with *its own* equality,
which is why two records holding equal-but-distinct `List<T>`s are **not**
equal — `List<T>` never overrode `Equals`. Record equality is one level deep,
not recursive.
*Follow-up: "how would you make it deep?" (write your own `Equals`, or use
immutable collections with value equality). Weak here -> redo
`06_structs_records` review.*

**Q19. `IEquatable<T>` — why does it exist when `Equals(object)` already does?** [*]

To avoid the boxing and the cast. `Equals(object)` boxes a struct argument and
requires a type check; `Equals(T)` is strongly typed and fast, and the
framework's collections look for it first. Implement both, keep them
consistent, and remember `Equals(object)` still has to work because that is what
generic code without a constraint will call.
*Follow-up: "what about `IComparable<T>`?" (the ordering equivalent, and the
same reasoning). Weak here -> redo `05_interfaces` challenge.*

### Collections, LINQ and deferred execution

**Q20. `IEnumerable<T>` versus `ICollection<T>` versus `IList<T>` — when do you use each?** [**]

`IEnumerable<T>` promises only that you can iterate. `ICollection<T>` adds
`Count`, `Add`, `Remove`, `Contains`. `IList<T>` adds positional access. Take
the weakest one your code actually needs as a parameter, so callers can pass an
array, a list or a lazy query without materialising anything; return something
concrete or a read-only interface so callers know what they have.
*Follow-up: "what is the risk of returning `IEnumerable<T>`?" (Q22). Weak here
-> redo `08_collections`.*

**Q21. What is deferred execution?** [***]

A LINQ query is a plan, not a result. `orders.Where(p)` builds an object holding
the source and the predicate and reads nothing; the filtering happens inside
`MoveNext` when something enumerates it. So a query built and never enumerated
never runs, a query enumerated twice runs twice, and the results reflect the
source *as it is at enumeration time*, not when you wrote the query.
*Follow-up: "which operators are not deferred?" (`ToList`, `Count`, `Sum`,
`First`, `Any`, `All`, `Aggregate` — anything that returns a non-sequence).
Weak here -> redo `10_linq_1` ex3.*

**Q22. What is the multiple-enumeration problem?** [***]

Enumerating the same `IEnumerable<T>` more than once re-runs whatever produces
it. `if (query.Any()) { foreach (var x in query) ... }` is two executions; over
EF Core that is two round trips to the database, and over a network stream it
is either an exception or different data the second time. The fix is to
materialise once at the boundary where you stop composing and start consuming:
`var results = query.ToList();`.
*Follow-up: "and what is the opposite mistake?" (calling `ToList()` in the
middle of a chain, forcing everything into memory). Weak here -> redo `i1` ex3.*

**Q23. `IEnumerable<T>` versus `IQueryable<T>` — what is the actual difference?** [***]

`IEnumerable<T>`'s operators take compiled delegates and run in your process:
LINQ to Objects. `IQueryable<T>`'s take *expression trees* — a data structure
describing the lambda — which a provider like EF Core walks and translates into
SQL. Identical-looking code, two execution stories. The tell is the static type,
and the classic bug is calling a method EF cannot translate, which either throws
or (in older versions) silently fetched the whole table and filtered in memory.
*Follow-up: "what makes a query stop being translatable?" (any C# method the
provider does not recognise; `AsEnumerable()` deliberately draws the line).
Weak here -> redo `10_linq_1` reading.*

**Q24. What is the difference between `First`, `FirstOrDefault` and `Single`?** [**]

`First` returns the first match and throws if there is none. `FirstOrDefault`
returns `default(T)` instead of throwing — `null` for a reference type, `0` for
an `int`, which is the trap. `Single` demands *exactly one* match and throws if
there are none or several. Use `Single` on a unique key: it turns a duplicate
into a loud failure at the right moment instead of a silent wrong answer.
*Follow-up: "when is `FirstOrDefault` dangerous?" (over value types, where the
default is indistinguishable from a real result). Weak here -> redo `10_linq_1`
ex2.*

**Q25. What does `yield return` do?** [**]

It turns the method into a compiler-generated state machine implementing
`IEnumerator<T>`: each `yield return` hands one item to the consumer and pauses
the method, with locals preserved, until the next `MoveNext`. So the body does
not run when you call the method, the sequence can be infinite, and each new
`foreach` starts it over from the beginning.
*Follow-up: "why do framework iterator methods validate arguments in a separate
non-iterator wrapper?" (so the validation happens at the call, not at first
enumeration). Weak here -> redo `08_collections` ex4.*

**Q26. When would you pick `Dictionary` over `List`?** [**]

When the question you keep asking is "what is the value for this key?" or "is
this in there?". A `List.Contains` walks the whole list — n² if it is inside a
loop over another list — while a dictionary or `HashSet` hashes to one bucket
and is O(1) on average. The trade is memory and the requirement that keys have
a sensible `GetHashCode`.
*Follow-up: "what makes a hash table degrade to O(n)?" (every key hashing to
the same bucket). Weak here -> redo `08_collections`.*

### Resources, `IDisposable` and the GC

**Q27. What does `IDisposable` exist for?** [***]

For deterministic release of things the garbage collector does not manage or
cannot release soon enough: file handles, sockets, database connections,
unmanaged memory, subscriptions. The GC will eventually collect the object, but
"eventually" is not good enough for a file lock or a connection from a pool of
100. `Dispose` says "release it now".
*Follow-up: "what happens if you forget?" (the handle is held until finalisation
or process exit — and connection-pool exhaustion is the usual symptom). Weak
here -> redo `12_exceptions` ex4.*

**Q28. What does `using` compile to?** [***]

A `try`/`finally` whose `finally` calls `Dispose()`. That is the whole feature,
and it is why disposal happens even when the block throws — the resource is
released while the stack unwinds, before any outer `catch` runs. The
declaration form (`using var x = ...;`) disposes at the end of the enclosing
block; the statement form scopes it more tightly.
*Follow-up: "what is `await using`?" (`IAsyncDisposable`, for cleanup that is
itself asynchronous). Weak here -> redo `12_exceptions` ex4.*

**Q29. Must `Dispose` be safe to call twice?** [**]

Yes — the documented contract says all calls after the first must be ignored.
Nested `using`s, a container disposing something you also disposed, or an
explicit call before the block ends all produce a second call. A `bool
_disposed` guard is the standard implementation.
*Follow-up: "when do you need the full `Dispose(bool)` pattern with a
finaliser?" (Q30). Weak here -> redo `12_exceptions` ex4.*

**Q30. When do you need a finaliser?** [*]

Almost never. Only when your type owns an *unmanaged* resource directly — a raw
handle or pointer — so that a forgotten `Dispose` does not leak it permanently.
If your class merely holds other `IDisposable`s, a finaliser is actively
harmful: it promotes the object to the finalisation queue and delays collection
by a generation. `SafeHandle` exists so you rarely have to write one.
*Follow-up: "what does `GC.SuppressFinalize` do?" (tells the GC the finaliser is
unnecessary because `Dispose` already ran). Weak here -> redo `12_exceptions`
reading.*

**Q31. Explain GC generations.** [**]

The heap is split into gen 0, gen 1 and gen 2, on the observation that most
objects die young. New allocations go into gen 0, which is collected often and
cheaply; survivors are promoted to gen 1, then gen 2, which is collected rarely
and expensively. There is also the Large Object Heap for objects over about
85 KB, which is collected with gen 2 and is not compacted by default. The
practical takeaway: short-lived garbage is nearly free, and long-lived objects
that die are the expensive kind.
*Follow-up: "so what should you avoid?" (allocations in hot loops that survive
long enough to be promoted; and holding references longer than needed). Weak
here -> this is awareness-level; the reading links cover it.*

**Q32. Does .NET have memory leaks?** [**]

Not in the C++ sense, but you can absolutely keep objects alive forever. The
common causes: a static collection that only grows, an event subscription never
removed (the publisher holds a reference to the subscriber), a captured variable
in a long-lived lambda, and an undisposed resource holding a native handle.
"Leak" in .NET means "unintentionally reachable".
*Follow-up: "why does `+=` on an event cause a leak?" (the publisher's
invocation list holds the subscriber; `-=` is the fix). Weak here -> redo
`09_delegates_events_lambdas` reading.*

### Inheritance, interfaces and polymorphism

**Q33. `virtual`/`override` versus `new` — what is the difference?** [***]

`override` replaces the base implementation, and calls are dispatched on the
*runtime type* of the object, so a base-typed variable holding a derived object
still gets the derived version. `new` declares a separate method that merely
hides the base one, and calls are resolved from the *compile-time type* of the
variable — so the same object gives two different answers depending on how you
were holding it. `new` exists for versioning (a base class adding a method must
not silently capture your derived one) and is almost never what you want.
*Follow-up: "why does C# require the `override` keyword at all, when Java does
not?" (so you cannot override by accident). Weak here -> redo
`04_inheritance_polymorphism` ex3.*

**Q34. Abstract class or interface — how do you choose?** [***]

An abstract class can hold state, constructors and non-public members, and a
type may have only one; an interface holds no state and a type may implement
any number. So: abstract class when the implementers genuinely share data and
implementation and form one family; interface when you are describing a
*capability* unrelated types can have. `Stream` is an abstract class;
`IDisposable` is an interface. Most designs use both.
*Follow-up: "what changed with default interface methods?" (Q35). Weak here ->
redo `05_interfaces`.*

**Q35. What are default interface methods for?** [*]

Versioning. Before C# 8, adding a member to a published interface broke every
implementer at compile time; a default implementation lets a library add one
safely. The catch is that a default member is only callable through the
interface type, not through the implementing class, so they are not a general
code-sharing mechanism.
*Follow-up: "what if two interfaces supply conflicting defaults?" (the class
must resolve it explicitly). Weak here -> redo `05_interfaces` ex3.*

**Q36. Why "favour composition over inheritance"?** [**]

Because inheritance couples you to every decision the base class made, forever,
and you only get one base class. Composition — holding a collaborator and
delegating — lets you combine behaviours, swap them at run time, and test with
a fake. The rule of thumb: inherit for genuine *is-a* plus shared
implementation, compose for everything else, and be suspicious of hierarchies
more than two deep.
*Follow-up: "give an example where inheritance breaks the contract"
(`Square : Rectangle` with independent width and height setters — the Liskov
example). Weak here -> redo `04_inheritance_polymorphism` reading.*

**Q37. What does `sealed` do and when would you use it?** [*]

It prevents further derivation, which communicates "this is not an extension
point" and occasionally lets the JIT devirtualise a call. The cost is that
consumers cannot subclass it in tests. Library guidance is to seal public types
by default (unsealing later is easy, sealing later is a breaking change);
application code usually does not bother.
*Follow-up: "does sealing actually make it faster?" (sometimes, marginally —
not a reason on its own). Weak here -> redo `04_inheritance_polymorphism` ex4.*

**Q38. Why should you never call a virtual method from a constructor?** [**]

Because the base constructor runs before the derived one, so a virtual call from
the base lands in the derived override while the derived object is still
half-built — its fields not yet assigned, its `readonly`s not yet set. The
symptom is a `NullReferenceException` in an override that "cannot" be null.
*Follow-up: "what is the correct pattern instead?" (an init method called after
construction, or pass the value through the constructor). Weak here -> redo
`04_inheritance_polymorphism` reading.*

**Q39. What is explicit interface implementation for?** [*]

Two reasons: two interfaces demanding the same signature with different
meanings, and keeping a noisy interface member off your type's public surface.
An explicitly implemented member has no access modifier and is only reachable
through the interface, which also means calling it on a struct boxes it.
*Follow-up: "name a place the BCL does this" (`IEnumerable.GetEnumerator`, the
non-generic one). Weak here -> redo `05_interfaces` ex2.*

### Records and immutability

**Q40. What does `record` actually generate?** [**]

A class (or struct, for `record struct`) with: init-only properties from the
positional parameters, a constructor, value-based `Equals`/`GetHashCode`/`==`,
`IEquatable<T>`, a readable `ToString` printing every property, a
`Deconstruct`, and a copy constructor that `with` uses. Everything it generates
you could write by hand; the type is ordinary.
*Follow-up: "is a record immutable?" (positional properties are `init`-only, but
you can add mutable members — it is a convention, not a guarantee). Weak here ->
redo `06_structs_records`.*

**Q41. What does a `with` expression do — and how deep does it copy?** [**]

It creates a copy of the record with the named properties replaced; everything
else is carried over. The copy is **shallow**: a member holding a reference is
copied as a reference, so both records point at the same list. Combined with
one-level-deep equality, that is why a record holding a `List<T>` is an
immutable wrapper around a mutable thing.
*Follow-up: "how would you fix that?" (immutable collection types like
`ImmutableArray<T>`). Weak here -> redo `06_structs_records` review.*

**Q42. Why prefer immutable data?** [**]

Because nothing can change behind your back: no method you call can mutate your
object, no other thread can see a half-updated state, and equality and hashing
stay stable. The cost is allocation per change, which is why `with` exists to
make that cheap to write. In practice: records for data (DTOs, events, query
results), classes for things with identity and behaviour.
*Follow-up: "what about performance?" (more allocations, but gen-0 garbage is
cheap; measure before trading away the safety). Weak here -> redo
`06_structs_records`.*

### Generics

**Q43. Why generics rather than `object`?** [**]

Type safety at compile time, no casts, and no boxing for value types. Before
generics, `ArrayList` stored `object`, so every `int` was boxed and every read
required a cast that could fail at run time. `List<int>` stores ints inline.
That is why the whole framework was rewritten around generics in .NET 2.
*Follow-up: "how do .NET generics differ from Java's?" (Q44). Weak here -> redo
`07_generics`.*

**Q44. Are .NET generics erased?** [*]

No — they are reified: type arguments exist at run time. The JIT compiles a
separate specialisation per value-type argument and shares one among reference
types. So `typeof(List<int>) != typeof(List<string>)`, reflection can inspect
type arguments, and generic collections of value types are genuinely fast. Java
erases them, which is why it boxes everything and cannot ask.
*Follow-up: "what does that let you do?" (serializers, DI containers and
`dojo`-style reflection over generic types). Weak here -> redo `07_generics`
reading.*

**Q45. What are generic constraints for?** [**]

They tell the compiler what you may do with `T` — and tell callers which types
are allowed. `where T : IComparable<T>` makes `CompareTo` legal; `where T :
new()` makes `new T()` legal; `where T : class` makes `null` meaningful; `where
T : notnull` is what `Dictionary` requires of its key. Add the fewest that let
you write the body, because each one narrows who can call you.
*Follow-up: "what can you not constrain?" (an arbitrary operator or a
constructor with parameters — though `INumber<T>` in .NET 7 finally covers the
maths case). Weak here -> redo `07_generics` ex2.*

**Q46. Explain covariance and contravariance.** [**]

`out T` (covariant) means `T` only ever comes *out*, so `IEnumerable<string>`
can be used as `IEnumerable<object>`. `in T` (contravariant) means `T` only ever
goes *in*, so `Action<object>` can be used as `Action<string>`. If a type does
both it must be invariant — `List<T>` is, and must be, because otherwise you
could add an `int` to a `List<string>` through an `object` view. The compiler
checks the safety condition at declaration.
*Follow-up: "why are arrays unsafe here?" (C# allows `object[] a = new
string[1]`, and the store throws `ArrayTypeMismatchException` at run time — the
mistake generics were designed not to repeat). Weak here -> redo `07_generics`
ex4.*

**Q47. What is `default(T)` and why is it a trap?** [*]

It is the zero value: `null` for reference types, `0` for numerics, `false` for
`bool`, the all-zero value for a struct. It is a trap when used to mean "no
result", because `0` and `false` are legitimate results — which is why
`FirstOrDefault` over `int` is ambiguous, why the `Try...` pattern returns a
`bool`, and why `Result<T>`-style types exist.
*Follow-up: "how do you say 'no value' safely?" (a nullable type, a `bool` +
`out`, or a result type). Weak here -> redo `07_generics` ex3.*

### Delegates, lambdas and events

**Q48. What is a delegate?** [**]

A type-safe object holding a target and a method — effectively a function
reference with an optional `this`. `Func<...>` and `Action<...>` are the
built-in families, and delegates are *multicast*: `+` appends to an invocation
list and invoking calls them all in order. Because a delegate holds its target,
it keeps that object alive.
*Follow-up: "how does that cause a memory leak?" (Q50). Weak here -> redo
`09_delegates_events_lambdas`.*

**Q49. What does a lambda capture — the value or the variable?** [***]

The variable. The compiler hoists it into a hidden object shared by the lambda
and the enclosing method, so later changes are visible to the lambda. That is
what makes a closure counter work, and it is why three lambdas created in a
`for` loop all see the loop's final value. `foreach` gives each iteration a
fresh variable (since C# 5), so the same code in a `foreach` behaves the way
people expect.
*Follow-up: "how do you fix the `for` version?" (copy into a local inside the
loop body). Weak here -> redo `09_delegates_events_lambdas` ex2.*

**Q50. What is the difference between an event and a delegate field?** [**]

An `event` restricts the outside world to `+=` and `-=`: only the declaring
class can invoke it or replace the whole list. A public delegate field lets any
caller raise it or wipe every subscriber with `=`. Raise with `?.Invoke(this,
args)`, which both handles the no-subscribers case and copies the delegate so a
concurrent unsubscribe cannot null it between the check and the call.
*Follow-up: "what is the event leak?" (the publisher holds subscribers alive;
unsubscribe with `-=` or use a weak pattern). Weak here -> redo
`09_delegates_events_lambdas` ex3.*

**Q51. When would you use a local function instead of a lambda?** [*]

When you do not need a delegate. A local function can be recursive, can use
`ref`/`out`, gets better error messages, and allocates nothing unless it is
captured or converted. Use a lambda when the behaviour has to be *passed*
somewhere.
*Follow-up: "when does a lambda allocate?" (each time the enclosing scope runs,
if it captures; non-capturing lambdas are cached). Weak here -> redo
`09_delegates_events_lambdas` reading.*

### Exceptions

**Q52. When should you throw an exception rather than return a failure?** [***]

When the failure is something the caller could not reasonably have anticipated
or handled. Malformed user input is expected — return a `bool` and use the
`Try...` pattern. A null argument, a broken invariant or a missing configuration
file is a bug or an emergency — throw. Exceptions also cost real time (stack
capture and unwinding), so using them for ordinary control flow is slow as well
as confusing.
*Follow-up: "give an example of the same class doing both" (an account that
returns `false` for an overdraft and throws for a negative deposit). Weak here ->
redo `12_exceptions`.*

**Q53. What is the difference between `throw;` and `throw ex;`?** [***]

`throw;` rethrows the current exception with its original stack trace intact.
`throw ex;` throws the same object with the stack trace reset to that line, so
the log now says the failure happened in your catch block — destroying the
evidence you needed. There is essentially no reason for the second; if you need
to add context, wrap: `throw new MyException("...", ex);`.
*Follow-up: "how do you preserve a stack trace across threads?"
(`ExceptionDispatchInfo.Capture(ex).Throw()`, which is what `await` does). Weak
here -> redo `12_exceptions`.*

**Q54. Why keep the inner exception when you wrap?** [**]

Because your exception's stack trace starts where *you* threw it — in the catch
block, not at the failure. The inner exception remembers where it actually
happened, and every logger prints the chain. Dropping it produces the log entry
everyone has seen: a friendly message with no information in it.
*Follow-up: "what should the message contain?" (whatever you would want to grep
for — the offending value). Weak here -> redo `12_exceptions` ex2.*

**Q55. What are exception filters (`when`) good for?** [*]

Splitting one exception type by its data, and — more subtly — deciding *before*
the stack unwinds. A filter that returns false leaves the exception continuing
from its original throw point with everything intact, whereas catch-and-rethrow
has already unwound. They are also the tidy way to exclude cancellation:
`catch (Exception ex) when (ex is not OperationCanceledException)`.
*Follow-up: "what is the logging-filter trick?" (`when (Log(ex))` where `Log`
returns false — logs at the throw site without catching). Weak here -> redo
`12_exceptions` ex3.*

**Q56. Which exception type should you throw?** [*]

`ArgumentNullException` for a null argument, `ArgumentOutOfRangeException` for a
value outside a valid range, `ArgumentException` for anything else wrong with an
argument, `InvalidOperationException` when the object is not in a state where
the call makes sense, `NotSupportedException` for something this implementation
will never do. Do not derive from `ApplicationException` — it is explicitly not
recommended; derive from `Exception`.
*Follow-up: "when is a custom exception worth it?" (when somebody might
reasonably catch that specifically). Weak here -> redo `12_exceptions`.*

### async and await

**Q57. What does `await` actually do?** [***]

It checks whether the awaited task is already complete; if so, execution
continues synchronously. If not, the method *returns* to its caller after
registering a continuation, and resumes at that point when the task completes.
The compiler rewrites the method into a state machine, with locals promoted to
fields so they survive the gap. Crucially, no thread sits waiting: for real I/O
there is no thread involved at all until the completion arrives.
*Follow-up: "so does async make things faster?" (Q58). Weak here -> redo
`13_async_await`.*

**Q58. Does `async` make code run in parallel?** [***]

No. `async`/`await` is about not blocking a thread while waiting; it lets a
server handle far more concurrent requests with far fewer threads. Concurrency
comes from starting several operations and awaiting them together with
`Task.WhenAll`; parallelism for CPU-bound work comes from `Task.Run` or
`Parallel.For`. Using `async` for CPU-bound work is a common and revealing
mistake.
*Follow-up: "how would you speed up two independent awaits?" (start both, then
`await Task.WhenAll`). Weak here -> redo `13_async_await` ex1.*

**Q59. What is wrong with `.Result` or `.Wait()`?** [***]

Two things. It blocks the calling thread, which defeats the point and, on a
server, burns a thread that could be serving a request. And it wraps any failure
in an `AggregateException`, so `catch (InvalidOperationException)` no longer
catches. Under a synchronization context (WPF, WinForms, classic ASP.NET) it
also deadlocks: the continuation needs the very thread that is blocking.
*Follow-up: "what is `ConfigureAwait(false)` for?" (Q60). Weak here -> redo
`13_async_await` ex4.*

**Q60. What does `ConfigureAwait(false)` do, and when do you need it?** [**]

It says "resume the continuation anywhere; I do not need the captured
synchronization context". In a UI app the context is the UI thread, so
`ConfigureAwait(false)` avoids an unnecessary hop and prevents the classic
deadlock when someone above you blocks. Library code should use it everywhere,
because it cannot know its callers. ASP.NET Core has no synchronization context,
so in application code there it makes no difference.
*Follow-up: "why can't you just use it everywhere?" (in a UI app the code after
the await may need the UI thread). Weak here -> redo `13_async_await` reading.*

**Q61. Why is `async void` bad?** [***]

Because it returns nothing to await: the caller cannot know when it finished,
cannot wait for it, and cannot catch its exceptions — which are raised on the
synchronization context and typically crash the process. The only legitimate use
is an event handler, whose signature demands `void`; even there, the body should
be a `try`/`catch` around a call to an `async Task` method.
*Follow-up: "how would you test an `async void` method?" (you cannot, reliably —
which is itself the argument). Weak here -> redo `i1` ex4.*

**Q62. How does cancellation work?** [**]

Cooperatively. A `CancellationTokenSource` produces a `CancellationToken`, which
is a signal, not a weapon: nothing can abort running code from outside. Code
that wants to be interruptible checks
`token.ThrowIfCancellationRequested()` between steps, or passes the token to the
async APIs it calls. Cancelling a *wait* — `task.WaitAsync(token)` — stops you
waiting but does not stop the work.
*Follow-up: "should you log an `OperationCanceledException`?" (no — a client
hanging up is not an error; ASP.NET Core deliberately does not). Weak here ->
redo `13_async_await` ex3.*

## ex1

The two boxed `5`s are the cleanest demonstration in the language of what
"resolved at compile time" means. Both variables are typed `object`, so the
compiler picks `object`'s `==`, which is reference comparison — and boxing `5`
twice allocates two boxes. Change the declarations to `int` and the exact same
expression compiles to a numeric comparison and gives the opposite answer.

The string half is the mirror image: `string` overloaded `==` to compare text,
which is why comparing strings feels like comparing primitives and why
`ReferenceEquals` is the only reliable way to ask about identity. The exercise
made you write both so the difference is muscle memory rather than trivia.

The interview version of this is short: **`==` is static and chosen from the
declared types; `Equals` is virtual and chosen from the actual object.** Say
that, then give the boxed-`5` example, then stop.

## ex2

Three predictions, and the middle one is the one that catches people. Boxing
copies, so the box holds the value as it was; a `List<T>` indexer returns a copy
for a struct, so mutating what you got back changes nothing; and the identical
code with a class mutates the shared object.

The compiler detail worth knowing is that `list[0].Value = 99` on a struct does
not even compile — C# refuses because the write would be silently discarded.
This is one of the rare cases where the language protects you from a design
mistake rather than from a typo. An *array* of structs behaves differently,
because array indexing yields a real reference into the array's storage, so the
same line compiles and works there.

If you want one sentence for an interview: **a struct is copied by assignment,
by argument passing, by boxing and by most collection reads — so "where did the
copy happen?" is the question to ask whenever a mutation appears to vanish.**

## ex3

`Any()`, `Count()` and `Sum()` are three separate walks, and over a
`List<int>` nobody notices. Over an EF Core query it is three round trips; over
a `yield`-based stream it may be three re-computations; over a network reader it
may throw on the second attempt.

The fix has two acceptable forms and knowing both is the point: one `foreach`
accumulating what you need (allocates nothing), or `.ToList()` once and then
LINQ on the list (allocates a copy, reads better when there is more to do). What
is *not* acceptable is calling three operators on a parameter you did not
create, because you do not know what is behind it.

The rule of thumb worth carrying: **compose lazily, materialise once, at the
boundary where you stop composing and start consuming.**

## ex4

Two one-line fixes, and the value is entirely in being able to explain the
wrong versions.

`.Result` blocks a thread and wraps exceptions in an `AggregateException`; under
a synchronization context it deadlocks. The gate can tell `await` from `.Result`
by the exception type alone, which is a neat demonstration that the difference
is observable and not merely stylistic.

`async void` is worse because it is invisible: the method compiles, runs, and
its failures go somewhere nobody is looking. Returning `Task` means the caller
can await it, catch it, and — as the gate checks — see that the work after the
failure never happened.

Both of these come up in interviews as "have you seen this bug?", and the strong
answer names the mechanism (a blocked thread; an unobservable task) rather than
just "you should use await".

## review1

Two facts that sound obvious and are constantly muddled. First: C# passes
reference-type arguments **by value — the value being the reference**. So a
method can mutate the object it was handed and cannot repoint the caller's
variable. `ref` is what changes that, and being able to say precisely which of
the two the caller sees is the whole answer.

Second: strings are immutable, so there is no operation anywhere in .NET that
changes an existing string. `ToUpper`, `Trim`, `Replace` and `+=` all return new
ones, and a method that "modifies" its string parameter has modified only its
own local copy of the reference.

The `ReferenceEquals` check at the end is the third fact hiding in here:
identity and equality are different questions, and for strings the answer to one
tells you nothing about the other.

## Further reading

- [C# tour: types](https://learn.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/types) — the value/reference distinction stated formally.
- [Boxing and unboxing](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/types/boxing-and-unboxing) — with the IL, if you want to see the allocation.
- [Equality comparisons](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/equality-comparisons) — `==`, `Equals`, `ReferenceEquals`, and which to use when.
- [Fundamentals of garbage collection](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals) — generations, the LOH, and what "collected" means.
- [Deferred execution and lazy evaluation](https://learn.microsoft.com/en-us/dotnet/standard/linq/deferred-execution-lazy-evaluation) — the classification of every operator.
- [Async guidance](https://devblogs.microsoft.com/dotnet/configureawait-faq/) — Stephen Toub on contexts, deadlocks and `ConfigureAwait`.
- [Best practices for exceptions](https://learn.microsoft.com/en-us/dotnet/standard/exceptions/best-practices-for-exceptions) — what to throw, what to catch, what to leave alone.
