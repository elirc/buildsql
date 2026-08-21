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
