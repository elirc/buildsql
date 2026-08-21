# 00 — Hello, Dojo (C#)

Welcome to the C# track. This course teaches you C# by making you write it —
every line, yourself, in a real .NET solution that really compiles. Nothing
here fills in a method body for you. You edit a `.cs` file, you run one
command, and an automated gate tells you whether you were right; when you
weren't, it shows you the evidence and the sentence you need to reread.

The first thing to get straight is where things live, because C# splits a
lesson across two places and the split is not arbitrary. Your *code* lives in
a normal class library, `src/Lessons/`, one folder per lesson — because the
compiler needs it there, and because you should be reading real project
structure from day one, not a scratchpad. The *lesson* — this README, the
theory, the hints, the reference solutions — lives under `lessons/00_hello_dojo/`.
The gate that grades you lives in a third place, `tests/Gates/`, which is
exactly where tests live in every C# repository you will ever join.

So: **you edit files under `src/Lessons/`. You read files under `lessons/`.
You never edit `tests/Gates/`** — though you should absolutely read it, and
it is quoted verbatim at the bottom of this page.

## The loop

For this lesson the map is:

```
tracks/csharp/
├── src/Lessons/L00_HelloDojo/     <- YOU EDIT THESE
│   ├── Ex1.cs                        namespace CSharpDojo.L00_HelloDojo
│   ├── Ex2.cs
│   └── Ex3.cs
├── tests/Gates/L00_HelloDojoTests.cs  <- the gate (read it, never edit it)
└── lessons/00_hello_dojo/            <- this README, reading.md, hints
    ├── README.md
    ├── reading.md
    └── ex1/hints.md   ex2/hints.md   ex3/hints.md
```

The commands you will live in:

```
uv run dojo test csharp 00_hello_dojo        # grade the whole lesson
uv run dojo test csharp 00_hello_dojo ex2    # grade just one exercise
uv run dojo hint csharp 00_hello_dojo ex2    # stuck? reveal the next tier
uv run dojo read csharp 00_hello_dojo ex2    # the theory behind it
uv run dojo status csharp                    # the progress dashboard
uv run dojo next csharp                      # what should I do now?
```

`csharp` also answers to `cs`, so `uv run dojo test cs 00 ex2` is the same
command with less typing. If a run ever fails with a build error rather than a
test failure, `uv run dojo doctor` will tell you whether the solution itself
is broken.

Before you write a single line, run the gate and watch it fail:

```
uv run dojo test csharp 00_hello_dojo
```

Three red tests, each one a `NotImplementedException` thrown by a stub. That
is the correct state of a fresh checkout. Note what it is *not*: a compiler
error. Every stub in this course is written so the solution always builds —
`throw new NotImplementedException()` is a perfectly valid method body, and
shipping stubs that compile means a half-finished exercise never breaks the
lesson next to it.

## Concept — a method is a signature plus a body

Here is the smallest complete C# method:

```csharp
public static int Double(int n)
{
    return n * 2;
}
```

Read it left to right, because every word is load-bearing. `public` means
other code can call it. `static` means it belongs to the type rather than to
an instance, so you call it as `Calculator.Double(21)` and never have to
create a `Calculator` first. `int` is the return type — and unlike TypeScript,
C# never infers it for you: you always write it. `Double` is the name, and C#
convention is PascalCase for methods. `(int n)` is the parameter list, with
the type first and the name second.

That "always write the return type" rule is worth pausing on. It means C#
signatures are self-documenting in a way inferred languages are not: you can
read a method's contract without reading its body. It also means the compiler
checks your body against the promise you made, on every path, every time.

Two more pieces you will need below. String interpolation puts a `$` in front
of the string literal and `{}` around expressions:

```csharp
string track = "react";
string line = $"{track} has {11 + 1} lessons";   // "react has 12 lessons"
```

…and the conditional operator picks between two values inline:

```csharp
string label = count == 1 ? "item" : "items";
```

Both should feel familiar if you have written JavaScript. The `$` prefix is
the part people forget: without it, `"{track}"` is just those seven
characters.

## Exercise 1 — your first method

Edit `src/Lessons/L00_HelloDojo/Ex1.cs`. Implement `Greeter.Greet` so that it
returns a greeting built from the `name` it is given:

- `Greet("Eli")` must return `"Hello, Eli! Welcome to the dojo."`
- `Greet("Ada")` must return `"Hello, Ada! Welcome to the dojo."`

Exact string, including the comma, the exclamation mark and the final full
stop. Replace the `throw` with a `return`; leave the signature alone.

```
uv run dojo test csharp 00_hello_dojo ex1
```

## Exercise 2 — two parameters, and a decision

Edit `src/Lessons/L00_HelloDojo/Ex2.cs`. Implement `TrackInfo.Describe(name, lessons)`
so it returns a one-line summary:

- `Describe("csharp", 14)` → `"csharp: 14 lessons"`
- `Describe("react", 1)` → `"react: 1 lesson"`
- `Describe("dotnet", 0)` → `"dotnet: 0 lessons"`

Read those three lines again. Two of them are the same shape and one is not:
English pluralises on "exactly one", not on "more than one", so zero is
plural. Your method has to make that decision at runtime — there is no single
interpolated string that produces all three.

```
uv run dojo test csharp 00_hello_dojo ex2
```

## Exercise 3 — parse the number out of a slug

Edit `src/Lessons/L00_HelloDojo/Ex3.cs`. Implement `SlugParser.LessonNumber(slug)`,
which takes a lesson slug and returns its number as an `int`:

- `LessonNumber("07_generics")` → `7`
- `LessonNumber("00_hello_dojo")` → `0`
- `LessonNumber("13_async_await")` → `13`

The slug can contain more than one underscore, so take the *first* segment
rather than everything before the last one. Then turn that segment of text
into an `int` — the method's declared return type says `int`, and the compiler
will not let you hand back a `string`, which is the whole point of writing the
return type down.

```
uv run dojo test csharp 00_hello_dojo ex3
```

## The gate

This is the entire gate class, `tests/Gates/L00_HelloDojoTests.cs`:

```csharp
using CSharpDojo.L00_HelloDojo;

namespace CSharpDojo.Gates;

public class L00_HelloDojoTests
{
    [Fact]
    public void Ex1_GreetBuildsAGreetingFromAName()
    {
        Teach.Equal(
            "Hello, Eli! Welcome to the dojo.",
            Greeter.Greet("Eli"),
            "Greet(\"Eli\") must return exactly \"Hello, Eli! Welcome to the dojo.\" - "
                + "compare it character by character, punctuation included.");

        Teach.Equal(
            "Hello, Ada! Welcome to the dojo.",
            Greeter.Greet("Ada"),
            "The name has to come from the parameter, not be hard-coded - reread README ex1.");
    }

    [Fact]
    public void Ex2_DescribeAgreesWithItsOwnNumber()
    {
        Teach.Equal(
            "csharp: 14 lessons",
            TrackInfo.Describe("csharp", 14),
            "Describe(\"csharp\", 14) must return \"csharp: 14 lessons\".");

        Teach.Equal(
            "react: 1 lesson",
            TrackInfo.Describe("react", 1),
            "One lesson is a \"lesson\", not \"lessons\" - the plural is a decision your code "
                + "has to make, not a string you can interpolate once.");

        Teach.Equal(
            "dotnet: 0 lessons",
            TrackInfo.Describe("dotnet", 0),
            "Zero is plural in English: expect \"dotnet: 0 lessons\".");
    }

    [Fact]
    public void Ex3_LessonNumberReturnsAnInt()
    {
        Teach.Equal(
            7,
            SlugParser.LessonNumber("07_generics"),
            "LessonNumber(\"07_generics\") must return the int 7 - note \"07\" has a leading zero.");

        Teach.Equal(
            0,
            SlugParser.LessonNumber("00_hello_dojo"),
            "The first lesson is number 0. Parsing \"00\" gives 0, not an exception.");

        Teach.Equal(
            13,
            SlugParser.LessonNumber("13_async_await"),
            "Split on '_' and parse the first part - the rest of the slug can contain "
                + "more underscores, so take the first segment, not everything before the last one.");
    }
}
```

In plain English: each `[Fact]` is one exercise. `Teach.Equal(expected, actual, why)`
is this course's assertion helper — it behaves like xUnit's `Assert.Equal` but
prints the sentence first and the expected/actual pair underneath, so a
failure tells you what to reread rather than just what didn't match. You can
read it in `tests/Gates/Teach.cs`; there is nothing clever in there.

Note the naming: the class is `L00_HelloDojoTests` and each method starts
`Ex1_`, `Ex2_`, `Ex3_`. That is how `dojo test csharp 00_hello_dojo ex2`
translates into a `dotnet test --filter` expression, and it is the convention
every lesson in this track follows.

## The teaching point

The habit this lesson is building is *predicting the failure*. You ran the
gate before writing anything, so you knew what red looked like; now every red
run you see is a comparison against something, not a surprise.

The second habit is reading the whole signature. `public static int LessonNumber(string slug)`
tells you, before you read one line of the body, who may call it, whether you
need an instance, what goes in and what comes out. C# codebases are navigable
largely because of this — and the discipline of writing an honest signature
first, body second, is the single biggest difference between C# that ages well
and C# that doesn't.

Next: **01_types_variables**, where value types and reference types stop being
a footnote and start being the thing everything else rests on.
