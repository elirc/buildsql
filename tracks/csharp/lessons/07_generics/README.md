# 07 — Generics

Before generics, a collection that could hold anything held `object`, and every
read came back as `object`. You cast on the way out, you found out at *runtime*
when you cast wrong, and every value type you put in got boxed onto the heap.
`ArrayList` still exists in .NET so you can see what that was like. C# 2.0
added generics in 2005 and the entire library was rewritten around them, which
is why `List<T>` is the one you have been using without thinking about it.

A generic type or method has a *type parameter* — a placeholder the caller
fills in. `List<T>` is not a list of objects pretending to be typed; the
runtime creates a genuinely distinct `List<int>` with `int`-shaped storage, no
casts and no boxing. That last detail is where .NET generics differ from
Java's, and it is worth knowing why: Java erases type arguments at compile
time, .NET keeps them at runtime. Hence `typeof(List<int>)` is a real thing you
can ask questions about, and it is how the reflection in this lesson's ex4
works.

## Concept — a parameter that happens to be a type

A generic method declares its parameter in angle brackets:

```csharp
public static T FirstOr<T>(IEnumerable<T> items, T fallback) { ... }

int n  = FirstOr(new[] { 1, 2 }, -1);        // T inferred as int
string s = FirstOr(new List<string>(), "?"); // T inferred as string
```

You rarely write `FirstOr<int>(...)` because the compiler infers `T` from the
arguments. A generic *type* declares its parameters on the type itself:

```csharp
public class Box<T>
{
    public Box(T value) => Value = value;
    public T Value { get; }
}
```

**Constraints say what you may assume about T.** Inside an unconstrained
generic method, `T` might be anything, so you can barely do a thing with it:
no `+`, no `<`, no `new T()`, not even a guaranteed `null`. Constraints buy
those back one at a time:

```csharp
where T : IComparable<T>   // T has CompareTo, so you may order Ts
where T : class            // T is a reference type; null is available
where T : struct           // T is a non-nullable value type
where T : new()            // T has a public parameterless constructor
where T : notnull          // T is never null - what Dictionary<TKey,...> wants
where T : Shape            // T derives from Shape, so Shape's members are available
```

Several can be combined (`where T : class, IDisposable, new()`), and each type
parameter gets its own clause.

**Variance says which conversions are allowed.** An `IProducer<string>` and an
`IProducer<object>` are, by default, unrelated types — even though every string
is an object. Annotating the parameter changes that:

```csharp
public interface IProducer<out T> { T Produce(); }     // covariant: T only comes OUT
public interface IConsumer<in T> { void Consume(T x); } // contravariant: T only goes IN

IProducer<object> p = someStringProducer;   // legal with `out`
IConsumer<string> c = someObjectConsumer;   // legal with `in`
```

You have already used both without noticing: `IEnumerable<out T>` is why a
`List<string>` can be passed to a method taking `IEnumerable<object>`, and
`Action<in T>`/`IComparer<in T>` are contravariant for the same reason in
reverse. The compiler enforces the safety condition — a covariant `T` may only
appear in output positions — which is precisely the check that C# arrays skip,
and why `object[] a = new string[1]; a[0] = 42;` compiles and then throws.

**Generic maths, briefly.** Since .NET 7, interfaces can require *static*
members, which finally makes "sum any numeric type" expressible:
`where T : INumber<T>` gives you `T.Zero`, the operators, and
`T.CreateChecked`. That is the challenge.

## Exercise 1 — one method, any element type

Edit `src/Lessons/L07_Generics/Ex1.cs`. Implement `FirstOr<T>` (the first item,
or the fallback when the sequence is empty), `Swap<T>(ref T, ref T)`, and
`CountOf<T>`.

None of the three may name a concrete type, and none needs a constraint —
because none of them asks anything of `T` beyond existing. Notice on the way
past that `FirstOr` cannot return `null` for "nothing found": `T` might be an
`int`, which is exactly why the fallback is a parameter.

```
uv run dojo test csharp 07_generics ex1
```

## Exercise 2 — constraints, and what each one buys

Edit `src/Lessons/L07_Generics/Ex2.cs`. `Max<T>` is constrained
`where T : IComparable<T>` and returns the largest item, throwing
`InvalidOperationException` for an empty sequence. `Fill<T>` is constrained
`where T : new()` and returns a list of `count` freshly constructed `T`s.

The seeding question in `Max` is the interesting one: you cannot start from `0`
and you cannot start from `default(T)` — the gate passes a set of negative
numbers precisely to catch that. Take the first item you actually see.

```
uv run dojo test csharp 07_generics ex2
```

## Exercise 3 — a generic type of your own

Edit `src/Lessons/L07_Generics/Ex3.cs`. `Result<T>` holds either a value or a
reason there isn't one. The private constructor is written; implement the two
static factories `Ok` and `Fail`, and the `Value` and `Error` properties.

`Value` on a failed result must throw `InvalidOperationException`, not hand
back `default(T)`. A silent zero that means "no answer" travels a long way
before anything notices.

```
uv run dojo test csharp 07_generics ex3
```

## Exercise 4 — variance

Edit `src/Lessons/L07_Generics/Ex4.cs`. The two method bodies are
`return producer;` and `return consumer;` — and they do not compile until you
annotate each interface's type parameter. `IProducer<T>` only ever hands a `T`
out, so it wants `out`. `IConsumer<T>` only ever takes a `T` in, so it wants
`in`.

Write the returns first, read the errors, then fix the interfaces. The gate
also reflects over both interfaces to check the annotations landed.

```
uv run dojo test csharp 07_generics ex4
```

## Challenge — one algorithm for every numeric type

Edit `src/Lessons/L07_Generics/Challenge.cs`. Implement `Total<T>` and
`Average<T>`, both constrained `where T : INumber<T>`, so they work over
`int[]`, `double[]` and `decimal[]` alike. `Average` throws
`InvalidOperationException` on an empty sequence.

Honest difficulty note: the loop is trivial and the two unfamiliar pieces are
`T.Zero` (the additive identity, whatever `T` is) and `T.CreateChecked(count)`
(turning the `int` count into a `T` so the division type-checks). Static
abstract interface members are recent and genuinely strange the first time; the
hints walk you through them.

```
uv run dojo test csharp 07_generics challenge
```

## Review

`review1` is two more constrained generic methods — `FirstAbove` and
`CountBetween` — where the words "strictly" and "inclusive" decide the
comparison. `dojo review` will bring it back.

## The gate

This is the entire gate class, `tests/Gates/L07_GenericsTests.cs`:

```csharp
using System.Reflection;

using CSharpDojo.L07_Generics;

namespace CSharpDojo.Gates;

public class L07_GenericsTests
{
    [Fact]
    public void Ex1_OneMethodServesEveryElementType()
    {
        Teach.Equal(10, Utils.FirstOr(new[] { 10, 20 }, -1),
            "The first item of a non-empty sequence - reread README ex1.");
        Teach.Equal(-1, Utils.FirstOr(Array.Empty<int>(), -1),
            "Nothing to take, so the fallback comes back. Note you cannot write `return null` "
                + "here: T might be an int - reread README ex1.");
        Teach.Equal("none", Utils.FirstOr(new List<string>(), "none"),
            "The same method, a different T, no cast anywhere.");

        string first = "left";
        string second = "right";
        Utils.Swap(ref first, ref second);

        Teach.Equal("right", first,
            "Swap must exchange the CALLER's variables, which is what ref means - reread "
                + "README ex1.");
        Teach.Equal("left", second, "And the other way for the second one.");

        Teach.Equal(3, Utils.CountOf(new[] { 1, 2, 3 }), "Three items.");
        Teach.Equal(0, Utils.CountOf(Array.Empty<string>()), "No items.");
    }

    [Fact]
    public void Ex2_ConstraintsUnlockWhatYouCanDoWithT()
    {
        Teach.Equal(9, Constrained.Max(new[] { 3, 9, 2 }),
            "IComparable<T> is what makes item.CompareTo(best) legal - without the constraint "
                + "the compiler will not let you compare two Ts at all - reread README ex2.");

        Teach.Equal("pear", Constrained.Max(new[] { "apple", "pear", "fig" }),
            "string implements IComparable<string>, so the same method sorts words - and "
                + "\"pear\" is last alphabetically here.");

        Teach.Equal(-2, Constrained.Max(new[] { -9, -2, -5 }),
            "Seeding your running maximum with 0 or default(T) instead of the first item is "
                + "the classic bug: every value here is negative.");

        Teach.Throws<InvalidOperationException>(() => Constrained.Max(Array.Empty<int>()),
            "There is no largest item in an empty sequence, and default(T) would be a lie - "
                + "throw InvalidOperationException, which is what LINQ's own Max does.");

        List<Widget> made = Constrained.Fill<Widget>(3);
        Teach.Equal(3, made.Count, "Fill produces exactly count items - reread README ex2.");
        Teach.True(made[0] is not null && !ReferenceEquals(made[0], made[1]),
            "Each item must be a SEPARATE new T(). Adding the same instance three times is a "
                + "different thing entirely.");
    }

    public sealed class Widget
    {
        public int Value { get; set; }
    }

    [Fact]
    public void Ex3_ResultCarriesEitherAValueOrAReason()
    {
        Result<int> ok = Result<int>.Ok(42);

        Teach.True(ok.IsOk, "Ok produces a successful result - reread README ex3.");
        Teach.Equal(42, ok.Value, "...carrying the value it was given.");
        Teach.Equal("", ok.Error, "A successful result has nothing to explain, so Error is \"\".");

        Result<int> failed = Result<int>.Fail("not found");

        Teach.True(!failed.IsOk, "Fail produces a failed result.");
        Teach.Equal("not found", failed.Error, "...carrying the reason.");
        Teach.Throws<InvalidOperationException>(() => _ = failed.Value,
            "Asking a failed Result for its value must throw rather than hand back a silent "
                + "default(T) - a zero that means \"no answer\" is how bad data spreads - "
                + "reread README ex3.");

        Result<string> text = Result<string>.Ok("hello");
        Teach.Equal("hello", text.Value,
            "The same generic type at a different T, with no casting and no boxing.");
    }

    [Fact]
    public void Ex4_VarianceDecidesWhichConversionsAreLegal()
    {
        Type producerParameter = typeof(IProducer<>).GetGenericArguments()[0];
        Teach.True(producerParameter.GenericParameterAttributes.HasFlag(GenericParameterAttributes.Covariant),
            "IProducer only ever hands a T out, so its parameter should be COVARIANT: declare "
                + "it `out T` - reread README ex4.");

        Type consumerParameter = typeof(IConsumer<>).GetGenericArguments()[0];
        Teach.True(consumerParameter.GenericParameterAttributes.HasFlag(GenericParameterAttributes.Contravariant),
            "IConsumer only ever takes a T in, so its parameter should be CONTRAVARIANT: "
                + "declare it `in T` - reread README ex4.");

        object produced = Variance.Widen(new GreetingProducer()).Produce();
        Teach.Equal("hello", produced,
            "Widen just returns its argument: with `out T`, an IProducer<string> already IS an "
                + "IProducer<object> and no conversion code is needed - reread README ex4.");

        Teach.Equal("consumed abc", Variance.Narrow(new AnythingConsumer()).Consume("abc"),
            "And with `in T`, a consumer of objects already IS a consumer of strings.");
    }

    [Fact]
    public void Challenge_OneSumForEveryNumericType()
    {
        Teach.Equal(6, Statistics.Total(new[] { 1, 2, 3 }),
            "T.Zero is the generic way to say \"the additive identity of whatever T is\" - "
                + "reread README challenge.");
        Teach.Equal(4.0, Statistics.Total(new[] { 1.5, 2.5 }),
            "The same method over doubles.");
        Teach.Equal(3.3m, Statistics.Total(new[] { 1.1m, 2.2m }),
            "...and over decimals, where 1.1 + 2.2 is exactly 3.3.");
        Teach.Equal(0, Statistics.Total(Array.Empty<int>()),
            "The sum of nothing is zero, and T.Zero already said so.");

        Teach.Equal(4, Statistics.Average(new[] { 2, 4, 6 }),
            "12 over 3. Turning the int count into a T is the interesting line: "
                + "T.CreateChecked(count) - reread README challenge.");
        Teach.Equal(2.5, Statistics.Average(new[] { 2.0, 3.0 }),
            "Over doubles the same code gives a fractional answer.");
        Teach.Throws<InvalidOperationException>(() => Statistics.Average(Array.Empty<double>()),
            "Dividing by zero items is undefined - throw rather than returning NaN.");
    }

    [Fact]
    public void Review1_ConstrainedGenericsOverTwoDifferentTs()
    {
        Teach.Equal(7, Thresholds.FirstAbove(new[] { 2, 5, 7, 9 }, 5, -1),
            "Strictly greater: 5 itself does not qualify - reread README review.");
        Teach.Equal(-1, Thresholds.FirstAbove(new[] { 1, 2 }, 99, -1),
            "Nothing qualifies, so the fallback comes back.");
        Teach.Equal("cat", Thresholds.FirstAbove(new[] { "ant", "cat", "dog" }, "b", "none"),
            "The same method over strings, comparing alphabetically.");

        Teach.Equal(3, Thresholds.CountBetween(new[] { 1, 5, 7, 9, 12 }, 5, 9),
            "Inclusive at both ends: 5, 7 and 9 all count - reread README review.");
        Teach.Equal(0, Thresholds.CountBetween(Array.Empty<int>(), 0, 10),
            "Nothing in an empty sequence falls anywhere.");
    }
}
```

In plain English: `Ex1` calls each method at two different `T`s, including the
empty cases, and checks `Swap` really moved the caller's variables. `Ex2`
checks `Max` over ints, strings and all-negative ints, the empty throw, and
that `Fill` produced distinct instances. `Ex3` walks a successful and a failed
`Result`, including the throw. `Ex4` reflects over both interfaces for the
variance annotations and then exercises the conversions. `Challenge` sums three
different numeric types, and `Review1` is the spaced-repetition variant.

## The teaching point

The rule of thumb for when to make something generic: **when the algorithm is
genuinely the same and only the type differs.** `FirstOr` is a real candidate —
the logic has nothing to do with what is in the sequence. A method that takes a
`T` and then immediately switches on `typeof(T)` is not: that is a normal
method wearing a costume, and it will be harder to read than the two methods it
replaced.

The constraint half of the rule is where the design lives. Every constraint you
add makes the method more capable and less applicable, so add the fewest that
let you write the body. When you find yourself wanting five constraints, that
is usually the signal to pass an interface — or, once lesson 09 gives you
delegates, a function — instead of demanding the type have the members baked in.

Next: **08_collections**, where the generic types you have been handed —
`List<T>`, `Dictionary<TKey, TValue>` and their relatives — finally get taught
properly.
