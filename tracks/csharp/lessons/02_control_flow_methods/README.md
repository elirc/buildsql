# 02 — Control flow and methods

So far every method you have written took a value and returned a value, in one
straight line. Real code branches, repeats, hands back more than one answer,
and gets called by people who do not want to supply every argument every time.
This lesson is the grammar for all of that — and it is deliberately the last
lesson before objects, because once you have classes you will be tempted to
solve everything with them, and a good half of C# is still just methods that
compute things.

There is a second thread running through it. C# has spent the last decade
growing *expression* forms of things that used to be *statements*: a `switch`
that produces a value instead of jumping around, a method body that is one
`=>`, a conditional that sits inside an interpolated string. Expression-shaped
code is easier to read because it has one exit and no in-between states, and
modern C# style reaches for it first. You will write both forms here and feel
the difference.

## Concept — the pieces

**Loops.** `for` when you know the shape of the counting, `foreach` when you
have a collection and don't care about indices, `while` when the trip count is
genuinely unknown until it stops:

```csharp
for (int i = 0; i < 3; i++) { }          // initialiser; condition; step
foreach (string word in words) { }        // no index, no off-by-one
while (queue.Count > 0) { }               // until something changes
```

`foreach` is the default in idiomatic C#. Reach for `for` when the index is
part of the problem, not out of habit.

**Parameters that hand things back.** A method returns one value. When you need
two, C# gives you `out`:

```csharp
if (int.TryParse(text, out int number))
{
    // number is usable here
}
```

`out` means "I will assign this before I return" and the compiler *checks* it —
every return path must assign every `out` parameter. `ref` is the cousin that
passes an existing variable in and out (the caller must have assigned it
first), and it is rare in application code. The `Try...` pattern above — a
`bool` result plus an `out` value — is the standard .NET way to say "this might
not work, and that is not exceptional".

**`params`.** A final `params T[]` parameter lets callers pass loose arguments:
`Sum(1, 2, 3)` instead of `Sum(new[] { 1, 2, 3 })`. Inside the method it is an
ordinary array, and an empty call gives you a zero-length array, never null.

**Optional and named arguments.** A parameter with a default may be omitted;
a named argument (`shout: true`) lets you skip the ones in between:

```csharp
static string Log(string message, string level = "info", bool stamp = false) { }

Log("started");
Log("started", stamp: true);   // level stays "info"
```

The catch worth knowing: defaults are baked in **at the call site** by the
compiler, so changing a default in a library does nothing for callers who
haven't recompiled. That is why public APIs often prefer overloads.

**`switch` as an expression.** The old statement form still exists; the
expression form is what modern code uses, and it returns a value:

```csharp
string size = count switch
{
    0 => "empty",
    1 => "single",
    < 10 => "small",
    _ => "large",
};
```

`< 10` is a *relational pattern*, `_` is the discard that catches the rest, and
arms are tried in order — so put the specific ones first. The compiler warns
when it cannot prove every input is covered, which is a genuinely useful
safety net you will meet again in lesson 06.

**Expression-bodied members.** When a method is one expression, `=>` says so:

```csharp
public static int Square(int n) => n * n;
```

Same method, less ceremony. Use it when the body really is one expression, not
to compress three statements into an unreadable one.

## Exercise 1 — count down

Edit `src/Lessons/L02_ControlFlowMethods/Ex1.cs`. Implement
`Sequences.Countdown(int from)`:

- `Countdown(5)` -> `"5, 4, 3, 2, 1, liftoff"`
- `Countdown(1)` -> `"1, liftoff"`
- `Countdown(0)` -> `"liftoff"`
- `Countdown(-3)` -> `"liftoff"`

Separator is a comma and a space, with none trailing. That last pair of cases
is the design pressure: the version where you append `"5, "` as you go has to
special-case the end, and the version that collects pieces and joins them once
does not.

```
uv run dojo test csharp 02_control_flow_methods ex1
```

## Exercise 2 — two answers and a variable number of arguments

Edit `src/Lessons/L02_ControlFlowMethods/Ex2.cs`. Two methods.

`Stats.TryMinMax(int[] values, out int min, out int max)` returns `true` and
fills both out parameters for a non-empty array. For an empty array it sets
both to `0` and returns `false` — no exception; "empty" is an ordinary
outcome here, not a bug.

`Stats.Sum(params int[] numbers)` adds up whatever it is given. `Sum()` is `0`,
`Sum(1, 2, 3)` is `6`, and `Sum(someArray)` works too.

```
uv run dojo test csharp 02_control_flow_methods ex2
```

## Exercise 3 — defaults, and calling by name

Edit `src/Lessons/L02_ControlFlowMethods/Ex3.cs`. Implement
`Greeting.For(string name, string salutation = "Hello", bool shout = false)`:

- `For("Ada")` -> `"Hello, Ada."`
- `For("Ada", "Hi")` -> `"Hi, Ada."`
- `For("Ada", shout: true)` -> `"HELLO, ADA!"`
- `For("Ada", "Hi", true)` -> `"HI, ADA!"`

Shouting changes two things: the whole line goes upper-case *and* the full stop
becomes an exclamation mark. Leave the signature exactly as it is — the gate
calls the third case by argument name, which only works because the parameter
is called `shout`.

```
uv run dojo test csharp 02_control_flow_methods ex3
```

## Exercise 4 — a switch that returns

Edit `src/Lessons/L02_ControlFlowMethods/Ex4.cs`. Implement
`Grades.Letter(int score)`: 90 and up is `"A"`, 80 up `"B"`, 70 up `"C"`, 60 up
`"D"`, anything lower `"F"`. A score below 0 or above 100 is not a grade at
all — throw `ArgumentOutOfRangeException`.

Two jobs, and they want to stay separate: a guard clause that rejects
impossible input, then a switch expression that maps the possible input. Notice
that `0` is a valid score and an `F`, while `-1` is neither.

```
uv run dojo test csharp 02_control_flow_methods ex4
```

## Challenge — the loop that doesn't know when it will stop

Edit `src/Lessons/L02_ControlFlowMethods/Challenge.cs`. The Collatz rule: from
any positive integer, halve it if it is even, otherwise triple it and add one.
Every number anyone has tried eventually reaches 1; nobody has proved they all
do.

`Collatz.Steps(int start)` counts the steps to reach 1 — `Steps(1)` is `0`,
`Steps(6)` is `8`. `Collatz.LongestUnder(int limit, out int steps)` returns
which starting number below `limit` takes the most steps, handing the count
back through `steps`; on a tie the smaller start wins.

Honest difficulty note: neither method is long, but three separate details bite
— an unbounded loop, an intermediate value that climbs far above where it
started, and a tie-break rule that is one character of difference.

```
uv run dojo test csharp 02_control_flow_methods challenge
```

## Review

`review1` asks for `Words.TryLongest(string sentence, out string longest)` —
ex2's running-maximum loop and `Try...` shape, with strings. `dojo review` will
bring it back in a few days.

## The gate

This is the entire gate class, `tests/Gates/L02_ControlFlowMethodsTests.cs`:

```csharp
using CSharpDojo.L02_ControlFlowMethods;

namespace CSharpDojo.Gates;

public class L02_ControlFlowMethodsTests
{
    [Fact]
    public void Ex1_CountdownEndsInLiftoff()
    {
        Teach.Equal("5, 4, 3, 2, 1, liftoff", Sequences.Countdown(5),
            "Count DOWN to 1, then append \"liftoff\". Separator is a comma and a space, "
                + "with no trailing separator - reread README ex1.");

        Teach.Equal("1, liftoff", Sequences.Countdown(1),
            "Starting at 1 still counts 1 before liftoff.");

        Teach.Equal("liftoff", Sequences.Countdown(0),
            "A start below 1 means the loop body never runs, so there is nothing to separate "
                + "- and no leading comma. If you got \", liftoff\" you glued the separator on "
                + "by hand instead of letting string.Join do it - reread README ex1.");

        Teach.Equal("liftoff", Sequences.Countdown(-3),
            "A negative start is the same case: the loop condition is false immediately.");
    }

    [Fact]
    public void Ex2_TryMinMaxAndSumHandTheirResultsBack()
    {
        bool found = Stats.TryMinMax(new[] { 4, -2, 9, 9 }, out int min, out int max);

        Teach.True(found, "A non-empty array has a minimum and a maximum, so TryMinMax returns "
            + "true - reread README ex2.");
        Teach.Equal(-2, min, "The smallest of 4, -2, 9, 9 is -2. Starting your running minimum "
            + "at 0 instead of at values[0] is the classic way to miss it.");
        Teach.Equal(9, max, "The largest of 4, -2, 9, 9 is 9, and a repeat of the maximum "
            + "changes nothing.");

        bool empty = Stats.TryMinMax(Array.Empty<int>(), out int emptyMin, out int emptyMax);

        Teach.True(!empty, "An empty array has no minimum: return false rather than throwing "
            + "- that is the whole point of the Try- prefix - reread README ex2.");
        Teach.Equal(0, emptyMin, "Even on the false path, C# requires every out parameter to be "
            + "assigned before you return. Set both to 0.");
        Teach.Equal(0, emptyMax, "Same for max: assigned, even though the caller should ignore it.");

        Teach.Equal(6, Stats.Sum(1, 2, 3), "params lets the caller pass loose arguments; inside "
            + "the method they are an int[] you can loop over.");
        Teach.Equal(0, Stats.Sum(), "params also allows NO arguments, which arrives as an empty "
            + "array - not null. Summing nothing is 0.");
        Teach.Equal(10, Stats.Sum(new[] { 1, 2, 3, 4 }), "A caller may also pass a real array; "
            + "the same method handles both.");
    }

    [Fact]
    public void Ex3_ForUsesItsDefaultsUntilYouOverrideThem()
    {
        Teach.Equal("Hello, Ada.", Greeting.For("Ada"),
            "Two arguments were left out, so both defaults apply - reread README ex3.");

        Teach.Equal("Hi, Ada.", Greeting.For("Ada", "Hi"),
            "The second positional argument replaces the salutation only.");

        Teach.Equal("HELLO, ADA!", Greeting.For("Ada", shout: true),
            "A named argument skips over the one in between, so the salutation is still the "
                + "default \"Hello\" - upper-cased, and ending in \"!\" - reread README ex3.");

        Teach.Equal("HI, ADA!", Greeting.For("Ada", "Hi", true),
            "Shouting upper-cases the whole line, salutation included.");
    }

    [Fact]
    public void Ex4_LetterIsASwitchOverRanges()
    {
        Teach.Equal("A", Grades.Letter(90), "90 is the bottom of the A band - the boundary is "
            + "inclusive.");
        Teach.Equal("B", Grades.Letter(89), "89 is one below the A band. Off-by-one at the "
            + "boundary is what this pair of checks is for - reread README ex4.");
        Teach.Equal("C", Grades.Letter(70), "70 is the bottom of the C band.");
        Teach.Equal("D", Grades.Letter(60), "60 is the bottom of the D band.");
        Teach.Equal("F", Grades.Letter(0), "0 is a valid score and an F. Valid and failing are "
            + "different things.");

        Teach.Throws<ArgumentOutOfRangeException>(() => Grades.Letter(101),
            "101 is not a score at all, so this is an argument problem, not an F. Throw "
                + "ArgumentOutOfRangeException - reread README ex4.");

        Teach.Throws<ArgumentOutOfRangeException>(() => Grades.Letter(-1),
            "A negative score is the other end of the same guard clause.");
    }

    [Fact]
    public void Challenge_CollatzCountsStepsAndFindsTheLongest()
    {
        Teach.Equal(0, Collatz.Steps(1), "1 is already 1, so the loop never runs - reread "
            + "README challenge.");
        Teach.Equal(8, Collatz.Steps(6), "6 -> 3 -> 10 -> 5 -> 16 -> 8 -> 4 -> 2 -> 1 is eight "
            + "steps. Count the arrows, not the numbers.");
        Teach.Equal(111, Collatz.Steps(27), "27 is the famous one: 111 steps, and the sequence "
            + "climbs to 9232 before it comes back down. A loop with no fixed trip count is "
                + "exactly what while is for - reread README challenge.");

        int start = Collatz.LongestUnder(1000, out int steps);

        Teach.Equal(871, start, "Under 1000 the longest chain starts at 871 - reread README "
            + "challenge.");
        Teach.Equal(178, steps, "871 takes 178 steps, and that number has to come back through "
            + "the out parameter, not through the return.");
    }

    [Fact]
    public void Review1_TryLongestPicksTheFirstLongestWord()
    {
        bool found = Words.TryLongest("the quick brown fox", out string longest);

        Teach.True(found, "There are words here, so TryLongest returns true.");
        Teach.Equal("quick", longest, "\"quick\" and \"brown\" are both five letters, and the "
            + "FIRST one wins - which is what a strictly-greater-than comparison gives you, "
                + "and what >= would not.");

        Teach.True(Words.TryLongest("hi", out string only) && only == "hi",
            "One word is trivially the longest word.");

        bool empty = Words.TryLongest("   ", out string nothing);

        Teach.True(!empty, "Whitespace holds no words: return false.");
        Teach.Equal("", nothing, "The out parameter still has to be assigned - use \"\", not null.");
    }
}
```

In plain English: `Ex1` pins the separator behaviour and both empty cases.
`Ex2` calls `TryMinMax` twice — once with data, once empty — and checks the
`out` values on both paths, then calls `Sum` three different ways. `Ex3` calls
`For` four ways, including one named argument. `Ex4` checks each band's
boundary and both ends of the guard clause. `Challenge` checks three step
counts and the search, and `Review1` is the spaced-repetition variant.

## The teaching point

The `Try...` pattern in ex2 is worth more than its size suggests. Every .NET
API that might fail for an ordinary reason offers it — `int.TryParse`,
`Dictionary.TryGetValue`, `Queue.TryDequeue` — and the alternative is a thrown
exception, which costs a stack unwind and turns "the user typed nonsense" into
a control-flow event. The rule teams settle on: **exceptions are for the
unexpected**; a caller who can reasonably expect failure deserves a return
value. You will meet the other half of that rule in `12_exceptions`.

The other habit is the guard clause in ex4. Validating at the top and throwing
immediately keeps the interesting part of the method flat — no nesting, no
`else`, no reader wondering which of four conditions is still true down at line
40. It reads as "here is what must be true; now here is the work", and once you
notice it you will see it in every well-kept C# codebase you open.

Next: **03_classes_objects**, where state stops living in parameters and starts
living in objects that own it.
