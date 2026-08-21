# 09 — Delegates, events and lambdas

Every method you have written so far was called by name. This lesson makes
methods into *values*: things you can store in a variable, pass as an argument,
return from a method, and keep in a list. Once behaviour can travel, a method
can take "what to do" as a parameter — which is how `List.Sort` sorts by
whatever you like, how a button knows what your click means, and how every
single LINQ operator in lesson 10 works.

The name for a variable that holds a method is a **delegate**. C# has had them
since version 1, back when you had to declare a named type for every shape;
today you use the two built-in families, `Func<...>` and `Action<...>`, and
write the methods inline as lambdas. The old declaration form still exists and
you will meet it in older code and in `EventHandler`.

There is one genuinely tricky thing here and it is worth arriving braced for
it: what a lambda *captures*. Not the value — the variable. Getting that
backwards produces one of the most famous surprises in C#, and ex2 walks you
straight into it on purpose.

## Concept — behaviour in a variable

```csharp
Func<int, int> twice = n => n * 2;        // takes an int, returns an int
Func<string, bool> isEmpty = s => s.Length == 0;
Action<string> log = message => Console.WriteLine(message);   // returns nothing
Func<int> now = () => 42;                 // no parameters

twice(21);      // 42 - call it exactly like a method
```

`Func<A, B, R>` reads "takes an A and a B, returns an R" — the **last** type
parameter is always the return type. `Action<...>` is the same with no return.
A method that takes one of these is *higher-order*: it decides when to call,
the caller decides what happens.

```csharp
public static int CountWhere<T>(IEnumerable<T> items, Func<T, bool> predicate)
{
    int count = 0;
    foreach (T item in items) { if (predicate(item)) { count++; } }
    return count;
}
```

**Lambdas are closures.** A lambda can use variables from the method that
created it, and those variables *live on* after that method returns — the
compiler hoists them into a hidden object:

```csharp
public static Func<int> MakeCounter()
{
    int count = 0;
    return () => ++count;      // count outlives MakeCounter
}
```

Two calls to `MakeCounter` produce two independent counters. And the capture is
**by variable, not by value** — if the variable changes later, the lambda sees
the change. That is the ex2 trap.

**Events are a delegate with etiquette.** An `event` is a delegate field that
only the declaring class may raise, while anyone may subscribe with `+=` and
unsubscribe with `-=`:

```csharp
public event EventHandler<PriceChangedEventArgs>? PriceChanged;

PriceChanged?.Invoke(this, args);   // ?. because an event with no subscribers is null
```

The .NET convention is `(object? sender, TEventArgs e)`, with the raiser
passing `this` as the sender. Delegates are also **multicast**: `+=` adds
another subscriber, and invoking calls them all, in subscription order.

## Exercise 1 — behaviour as an argument

Edit `src/Lessons/L09_DelegatesEventsLambdas/Ex1.cs`. Implement `Apply` (every
item through a `Func<T, T>`, collected in order), `CountWhere` (how many items
a `Func<T, bool>` says yes to), and `Repeat` (call an `Action<int>` once for
each number from 1 to `times`, inclusive).

None of the three knows or cares what the delegate does. That indifference is
the entire feature.

```
uv run dojo test csharp 09_delegates_events_lambdas ex1
```

## Exercise 2 — what a lambda captures

Edit `src/Lessons/L09_DelegatesEventsLambdas/Ex2.cs`. Implement `MakeCounter`
(a `Func<int>` handing back 1, then 2, then 3…), then two methods that build
three `() => i` lambdas — one from a `for` loop, one from a `foreach`.

Write both the obvious way. **Do not** copy the loop variable into a local
inside `FromForLoop`; the gate wants the naive version, because the naive
version is the famous one. Predict what each list of functions returns before
you run the gate — one of your two predictions is probably wrong, and that is
the exercise.

```
uv run dojo test csharp 09_delegates_events_lambdas ex2
```

## Exercise 3 — an event

Edit `src/Lessons/L09_DelegatesEventsLambdas/Ex3.cs`. Implement
`StockTicker.Update(newPrice)`: record the price, and raise `PriceChanged` with
the old and new values — but only when the price actually moved, and without
throwing when nobody has subscribed.

Three details to get right: capture the old price before you overwrite it,
update the state before you raise (a handler that reads `ticker.Price` should
see the new one), and use `?.Invoke`.

```
uv run dojo test csharp 09_delegates_events_lambdas ex3
```

## Exercise 4 — functions that build functions

Edit `src/Lessons/L09_DelegatesEventsLambdas/Ex4.cs`. `Compose(params steps)`
returns a single `Func<string, string>` that runs every step left to right,
feeding each result into the next — and with no steps returns the input
unchanged. `Combine(first, second)` returns one `Action` that runs both in
order, tolerating either (or both) being null.

Both methods return a lambda. Nothing happens when you call them; everything
happens when someone calls what they gave back.

```
uv run dojo test csharp 09_delegates_events_lambdas ex4
```

## Challenge — the middleware pipeline

Edit `src/Lessons/L09_DelegatesEventsLambdas/Challenge.cs`. A middleware here
is a `Func<Func<string,string>, Func<string,string>>`: hand it the next
handler and it gives you back a new handler that wraps it. `Build` wraps a core
handler in each middleware so that the **first one listed is the outermost**.

Honest difficulty note: the type is harder to read than the code is to write —
three lines, once the direction is clear. Get it right and you have built, in
miniature, the exact mechanism behind ASP.NET Core's request pipeline: order of
registration is order of nesting, and a middleware that never calls `next`
short-circuits everything inside it. The gate checks both.

```
uv run dojo test csharp 09_delegates_events_lambdas challenge
```

## Review

`review1` is `MakeAdder` (a running total in a closure) and `Not` (a predicate
wrapped in its opposite). `dojo review` will bring it back.

## The gate

This is the entire gate class, `tests/Gates/L09_DelegatesEventsLambdasTests.cs`:

```csharp
using CSharpDojo.L09_DelegatesEventsLambdas;

namespace CSharpDojo.Gates;

public class L09_DelegatesEventsLambdasTests
{
    [Fact]
    public void Ex1_TheCallerSuppliesTheBehaviour()
    {
        List<int> doubled = Behaviours.Apply(new[] { 1, 2, 3 }, n => n * 2);
        Teach.Equal("2, 4, 6", string.Join(", ", doubled),
            "Apply calls the transform once per item, in order, and collects the results - "
                + "reread README ex1.");

        List<string> trimmed = Behaviours.Apply(new[] { " a ", "b " }, s => s.Trim());
        Teach.Equal("a, b", string.Join(", ", trimmed),
            "The same method at a different T, with completely different behaviour passed in.");

        Teach.Equal(2, Behaviours.CountWhere(new[] { 1, 2, 3, 4 }, n => n % 2 == 0),
            "Two of the four are even. The predicate decides; CountWhere only counts - reread "
                + "README ex1.");
        Teach.Equal(0, Behaviours.CountWhere(Array.Empty<int>(), n => true),
            "Nothing to ask about.");

        List<int> seen = new List<int>();
        Behaviours.Repeat(3, n => seen.Add(n));

        Teach.Equal("1, 2, 3", string.Join(", ", seen),
            "Repeat counts from 1 to times inclusive and hands each number to the action - "
                + "reread README ex1.");
    }

    [Fact]
    public void Ex2_ALambdaCapturesTheVariableNotTheValue()
    {
        Func<int> counter = Closures.MakeCounter();

        Teach.Equal(1, counter(), "The first call hands back 1, not 0 - increment before you "
            + "return - reread README ex2.");
        Teach.Equal(2, counter(), "The captured local survived between calls: that is what a "
            + "closure is.");
        Teach.Equal(3, counter(), "And it keeps going.");

        Func<int> second = Closures.MakeCounter();
        Teach.Equal(1, second(),
            "A second counter has its OWN captured variable and starts again at 1.");

        List<Func<int>> fromFor = Closures.FromForLoop();
        Teach.Equal("3, 3, 3", string.Join(", ", fromFor.Select(f => f())),
            "The classic. A `for` loop has ONE variable i for the whole loop, so all three "
                + "lambdas captured the same variable - and by the time you call them, that "
                + "variable holds 3, the value that ended the loop. If you got 0, 1, 2 you "
                + "copied i into a local; write it the naive way and see the trap - reread "
                + "README ex2.");

        List<Func<int>> fromForeach = Closures.FromForeachLoop();
        Teach.Equal("0, 1, 2", string.Join(", ", fromForeach.Select(f => f())),
            "A `foreach` gives each iteration a FRESH variable (since C# 5), so each lambda "
                + "captured a different one. Same-looking code, opposite answer - reread "
                + "README ex2.");
    }

    [Fact]
    public void Ex3_TheTickerTellsItsSubscribers()
    {
        StockTicker ticker = new StockTicker();

        ticker.Update(10m);
        Teach.Equal(10m, ticker.Price,
            "Update records the new price whether or not anyone is listening - and must not "
                + "throw with no subscribers, which is what ?.Invoke buys you - reread README ex3.");

        List<string> log = new List<string>();
        ticker.PriceChanged += (sender, e) => log.Add($"{e.OldPrice}->{e.NewPrice}");

        ticker.Update(12m);
        Teach.Equal("10->12", string.Join(", ", log),
            "The event carries both prices, and the subscriber was called once - reread "
                + "README ex3.");

        ticker.Update(12m);
        Teach.Equal("10->12", string.Join(", ", log),
            "Setting the same price again is not a change: no event. If a second entry "
                + "appeared, you raised before you compared - reread README ex3.");

        int extra = 0;
        ticker.PriceChanged += (sender, e) => extra++;
        ticker.Update(15m);

        Teach.Equal(2, log.Count, "The first subscriber is still subscribed.");
        Teach.Equal(1, extra, "And the second one got the same event: an event is a broadcast, "
            + "not a hand-off.");
    }

    [Fact]
    public void Ex4_DelegatesComposeIntoNewDelegates()
    {
        Func<string, string> pipeline = Pipelines.Compose(s => s.Trim(), s => s.ToUpperInvariant());

        Teach.Equal("HI", pipeline("  hi  "),
            "Steps run left to right: trim, then upper-case - reread README ex4.");

        Func<string, string> identity = Pipelines.Compose();
        Teach.Equal("unchanged", identity("unchanged"),
            "No steps means nothing happens to the input. An empty params array is empty, not "
                + "null - reread README ex4.");

        Func<string, string> order = Pipelines.Compose(s => s + "a", s => s + "b");
        Teach.Equal("xab", order("x"),
            "Order matters and it is the order written: \"a\" is appended before \"b\".");

        List<string> ran = new List<string>();
        Action both = Pipelines.Combine(() => ran.Add("first"), () => ran.Add("second"));
        both();

        Teach.Equal("first, second", string.Join(", ", ran),
            "Combine runs both, in order - reread README ex4.");

        ran.Clear();
        Action onlyOne = Pipelines.Combine(null, () => ran.Add("second"));
        onlyOne();
        Teach.Equal("second", string.Join(", ", ran),
            "A null half is simply not run - and must not throw.");

        Pipelines.Combine(null, null)();
        Teach.True(true, "Combining two nulls gives an Action that does nothing, quietly. "
            + "If this test failed with an exception, you returned null instead.");
    }

    [Fact]
    public void Challenge_MiddlewareWrapsTheCoreInBothDirections()
    {
        Func<string, string> core = input => input;
        Func<Func<string, string>, Func<string, string>> brackets =
            next => input => "[" + next(input) + "]";
        Func<Func<string, string>, Func<string, string>> exclaim =
            next => input => next(input) + "!";

        Teach.Equal("[hi!]", Middleware.Build(core, brackets, exclaim)("hi"),
            "The FIRST middleware listed is the outermost, so the brackets go on last and "
                + "therefore outside the \"!\" - build the chain from the inside out - reread "
                + "README challenge.");

        Teach.Equal("[hi]!", Middleware.Build(core, exclaim, brackets)("hi"),
            "Swap the two and the nesting swaps with them. If both orders gave you the same "
                + "answer, you are not wrapping - you are just running them in sequence.");

        Teach.Equal("bare", Middleware.Build(core)("bare"),
            "With no middleware at all the core handler is the pipeline.");

        bool coreRan = false;
        Func<string, string> tracked = input =>
        {
            coreRan = true;
            return input;
        };
        Func<Func<string, string>, Func<string, string>> blocker = next => input => "blocked";

        Teach.Equal("blocked", Middleware.Build(tracked, blocker)("hi"),
            "A middleware that never calls its next short-circuits everything inside it.");
        Teach.True(!coreRan,
            "...and the core must genuinely not have run. This is exactly how ASP.NET Core "
                + "authentication middleware refuses a request - reread README challenge.");
    }

    [Fact]
    public void Review1_ClosuresKeepStateAndWrapBehaviour()
    {
        Func<int, int> add = Accumulators.MakeAdder();

        Teach.Equal(5, add(5), "First amount in, first total out.");
        Teach.Equal(8, add(3), "The running total is captured state - reread README review.");

        Func<int, int> other = Accumulators.MakeAdder();
        Teach.Equal(2, other(2),
            "A second adder has its own total. If this came back 10, your state is static "
                + "rather than captured per call.");

        Func<int, bool> isEven = n => n % 2 == 0;
        Func<int, bool> isOdd = Accumulators.Not(isEven);

        Teach.True(isOdd(3), "Not flips the answer.");
        Teach.True(!isOdd(4), "...both ways.");
        Teach.True(isEven(4), "And the original predicate is untouched - Not RETURNS a new "
            + "function rather than changing the one it was given.");
    }
}
```

In plain English: `Ex1` passes three different lambdas into the three methods
and checks the results and the ordering. `Ex2` calls a counter three times,
makes a second one, and then compares the two lists of loop-built lambdas —
the assertion messages explain the difference. `Ex3` updates the price with no
subscriber, with one, with an unchanged value, and with two subscribers.
`Ex4` composes, composes nothing, checks the order, and combines actions
including nulls. `Challenge` builds two pipelines with the middlewares in both
orders and checks the short-circuit, and `Review1` is the spaced-repetition
variant.

## The teaching point

The practical version of this lesson is: **when two methods differ by one
decision, pass the decision in.** Before delegates, "sort ascending" and "sort
descending" were two methods, or one method with a `bool` flag that told the
reader nothing at the call site. With a `Func`, there is one method and the
decision is written where it is made.

The other half is the closure trap, which is not academic — it appears every
time someone builds handlers, tasks or timers in a loop, and the symptom is
always "all of them did the last one". The C# team considered this common
enough to *change the language* for `foreach` in C# 5. The `for` loop still
behaves the old way, deliberately, because its variable is genuinely one
variable, and now you can explain why.

Next: **10_linq_1**, where these two ideas — a sequence produced lazily and a
function passed in — combine into the query syntax that will remind you very
strongly of SQL.
