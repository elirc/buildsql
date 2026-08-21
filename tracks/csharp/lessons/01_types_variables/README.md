# 01 — Types and variables

Every C# question you will ever be asked in an interview eventually walks back
to one sentence: **is this a value type or a reference type?** Not because
interviewers are pedants, but because the answer changes what an assignment
does, what passing to a method does, what equality means, and where the bytes
live. Get it wrong and you write a method that mutates its caller's data by
accident — or one that quietly doesn't, which is worse, because it fails in
production and not in the debugger.

The rest of this lesson is the machinery around that sentence. C# is a
statically typed language: every variable has a type at compile time, and the
compiler will not let you put a `string` in an `int`-shaped hole. That
strictness buys you conversions that are explicit about their cost, a
`decimal` type that money can trust, and — since C# 8 — a nullability layer
that tells you which references are allowed to be missing.

You already wrote one method in lesson 00. Now you find out what the values
flowing through it actually are.

## Concept — two families, one distinction

C# types come in two families and the difference is *where the value lives and
what a copy copies*.

A **value type** — `int`, `double`, `bool`, `decimal`, `char`, every `enum`,
every `struct` — holds its data directly. Assigning it, or passing it to a
method, copies all of that data:

```csharp
int a = 5;
int b = a;    // b is a second, independent 5
b = 99;       // a is still 5
```

A **reference type** — `string`, arrays, every `class`, every interface — holds
a *reference*: an arrow pointing at an object that lives somewhere else. Copying
the variable copies the arrow:

```csharp
int[] first  = { 1, 2, 3 };
int[] second = first;    // one array, two arrows
second[0] = 99;          // first[0] is now 99 as well
```

Nothing about that second snippet is a trick. It is the single most common
source of "why did my list change?" bugs in every language with references,
and C# makes it visible because you chose `class` or `struct` when you declared
the type.

**Conversions are explicit when they can lose.** A `long` fits every `int`, so
`long big = someInt;` needs no ceremony — that is an *implicit* conversion. The
other direction can lose data, so C# makes you write the cast and take
responsibility: `int small = (int)someLong;`. A cast from a floating-point type
truncates toward zero — `(int)3.9` is `3` and `(int)(-3.9)` is `-3` — which is
not the same as rounding and not the same as `Math.Floor`.

**`decimal` is for money.** `double` stores base-2 fractions, so 0.1 is not
exactly 0.1 and errors accumulate; `decimal` stores base-10 fractions in 128
bits and is exact for the numbers humans write on invoices. It is slower and
smaller in range, and nobody cares, because a cent that goes missing is a bug
report:

```csharp
double  d = 0.1 + 0.2;   // 0.30000000000000004
decimal m = 0.1m + 0.2m; // 0.3
```

**`var` infers, it does not weaken.** `var total = 0m;` declares a `decimal`,
full stop — the compiler works out the type from the right-hand side and the
variable is as statically typed as if you had written it out. Use it when the
right-hand side already names the type (`var order = new Order();`) and write
the type out when it doesn't (`var x = Parse(s);` tells the reader nothing).

**Nullable annotations.** With `<Nullable>enable</Nullable>` — which this
project has — `string` means "I promise this is not null" and `string?` means
"this might be missing, and the compiler will nag you until you check". For
value types the `?` is older and stronger: `int?` is a genuinely different type
(`Nullable<int>`) with `.HasValue` and `.Value`, and it cannot hold an `int`
without wrapping it. The `??` operator supplies a fallback for either:

```csharp
string display = maybeName ?? "unknown";
```

## Exercise 1 — the same code, two answers

Edit `src/Lessons/L01_TypesVariables/Ex1.cs`. The file gives you two types that
differ by exactly one keyword — `struct ReadingValue` and `class ReadingRef` —
and two methods to implement.

In each method: copy the parameter into a local variable, set the **local's**
`Degrees` to `99`, and return the **original's** `Degrees`. Write literally the
same three lines in both bodies. The gate expects `12` from the struct version
and `99` from the class version, and the entire lesson is in that difference.

```
uv run dojo test csharp 01_types_variables ex1
```

## Exercise 2 — conversions that lose things

Edit `src/Lessons/L01_TypesVariables/Ex2.cs`. Three small methods:

`Truncate(double)` chops the fraction off toward zero: `3.9 -> 3`, `-3.9 -> -3`.

`RoundHalfAwayFromZero(double)` rounds to the nearest whole number, and sends
an exact `.5` away from zero: `2.5 -> 3`, `3.5 -> 4`. This is not what
`Math.Round` does by default — its default is *banker's rounding*, which sends
`2.5` to `2` because 2 is even. That default exists for good statistical
reasons and surprises approximately everyone the first time.

`SafeAdd(int, int)` returns a `long` that is correct even for
`int.MaxValue + 1`. Careful: `a + b` is computed in `int` and the overflow has
already happened before anything widens.

```
uv run dojo test csharp 01_types_variables ex2
```

## Exercise 3 — things that might not be there

Edit `src/Lessons/L01_TypesVariables/Ex3.cs`. Implement
`Labels.Describe(string? name, int? age)`:

- `Describe("Ada", 36)` -> `"Ada (36)"`
- `Describe(null, 36)` -> `"anonymous (36)"`
- `Describe("   ", 36)` -> `"anonymous (36)"` — blank counts as missing
- `Describe("Ada", null)` -> `"Ada (age unknown)"`
- `Describe(null, null)` -> `"anonymous (age unknown)"`

Two independent decisions, not five cases. Note the two different `?`s in that
signature: `string?` is an annotation the compiler checks, and `int?` is a real
wrapper type with `.HasValue`.

```
uv run dojo test csharp 01_types_variables ex3
```

## Exercise 4 — money

Edit `src/Lessons/L01_TypesVariables/Ex4.cs`. Implement
`Money.LineTotal(decimal unitPrice, int quantity, decimal discountPercent)`:
multiply, take the discount off, and round to two decimal places with halves
going away from zero.

- `LineTotal(19.99m, 3, 0m)` -> `59.97m`
- `LineTotal(10m, 3, 10m)` -> `27.00m` (ten *percent*)
- `LineTotal(0.25m, 1, 50m)` -> `0.13m` (0.125 rounds away from zero)

Keep every intermediate value a `decimal`. The `m` suffix on a literal is what
makes it one; `100` is an `int` and `100.0` is a `double`.

```
uv run dojo test csharp 01_types_variables ex4
```

## Challenge — a line of text in, a line of text out

Edit `src/Lessons/L01_TypesVariables/Challenge.cs`. Implement
`ReceiptLine.Format(string line)`, which takes `"widget|19.99|3"` and returns
`"widget x3 = $59.97"`.

Honest difficulty note: nothing here is new, but it is the first time you have
to hold four ideas at once — splitting, parsing to two different types, decimal
arithmetic, and formatted output. The one genuinely new detail is culture:
`decimal.Parse` reads `"19.99"` differently on a machine whose locale writes
`19,99`, so pass `CultureInfo.InvariantCulture` when parsing and when
formatting. That `using System.Globalization;` at the top of the file is there
for you.

```
uv run dojo test csharp 01_types_variables challenge
```

## Review

`review1` comes back later, scheduled by `dojo review`, not now. It asks for
`SensorRow.Summarize(string? label, double? celsius)` — the null fallbacks of
ex3 and the rounding of ex2 in one method — and you will meet it again in three
days, then a week, then three weeks.

## The gate

This is the entire gate class, `tests/Gates/L01_TypesVariablesTests.cs`:

```csharp
using CSharpDojo.L01_TypesVariables;

namespace CSharpDojo.Gates;

public class L01_TypesVariablesTests
{
    [Fact]
    public void Ex1_CopyingAStructCopiesTheValue()
    {
        Teach.Equal(
            12,
            Copies.AfterCopyingAStruct(new ReadingValue { Degrees = 12 }),
            "ReadingValue is a struct, so `copy = original` duplicates the data. Writing 99 "
                + "into the copy cannot reach the original - reread README ex1.");

        Teach.Equal(
            99,
            Copies.AfterCopyingAClass(new ReadingRef { Degrees = 12 }),
            "ReadingRef is a class, so `copy = original` duplicates the arrow, not the object. "
                + "Both names point at one object, so writing 99 through the copy is visible "
                + "through the original - reread README ex1.");
    }

    [Fact]
    public void Ex2_ConversionsTruncateRoundAndWiden()
    {
        Teach.Equal(3, Conversions.Truncate(3.9),
            "A cast from double to int truncates toward zero: 3.9 -> 3, never 4.");

        Teach.Equal(-3, Conversions.Truncate(-3.9),
            "Truncation is toward ZERO, not downward: -3.9 -> -3, not -4. If you got -4 you "
                + "reached for Math.Floor - reread README ex2.");

        Teach.Equal(3, Conversions.RoundHalfAwayFromZero(2.5),
            "Math.Round's default is banker's rounding, which sends 2.5 to 2. This method has "
                + "to send it to 3, so pass MidpointRounding.AwayFromZero - reread README ex2.");

        Teach.Equal(4, Conversions.RoundHalfAwayFromZero(3.5),
            "Banker's rounding sends 3.5 to 4 as well, which is why 2.5 is the case that "
                + "catches you. Both must round away from zero here.");

        Teach.Equal(2147483648L, Conversions.SafeAdd(int.MaxValue, 1),
            "int.MaxValue + 1 wraps around to a negative number because the ADDITION happens "
                + "in int. Widen an operand to long before adding - reread README ex2.");
    }

    [Fact]
    public void Ex3_DescribeHandlesEveryMissingCombination()
    {
        Teach.Equal("Ada (36)", Labels.Describe("Ada", 36),
            "With both values present, Describe is just an interpolated string.");

        Teach.Equal("anonymous (36)", Labels.Describe(null, 36),
            "A null name becomes \"anonymous\" - reread README ex3.");

        Teach.Equal("anonymous (36)", Labels.Describe("   ", 36),
            "Blank is as missing as null here. string.IsNullOrWhiteSpace covers both in one "
                + "check - reread README ex3.");

        Teach.Equal("Ada (age unknown)", Labels.Describe("Ada", null),
            "int? has no value here, so the parentheses hold \"age unknown\" instead of a number.");

        Teach.Equal("anonymous (age unknown)", Labels.Describe(null, null),
            "Both decisions are independent: handle each one on its own rather than writing "
                + "one branch per combination.");
    }

    [Fact]
    public void Ex4_LineTotalIsDecimalMoneyMaths()
    {
        Teach.Equal(59.97m, Money.LineTotal(19.99m, 3, 0m),
            "19.99 x 3 is 59.97 exactly in decimal. If you saw 59.970000000000006 you did the "
                + "maths in double somewhere - reread README ex4.");

        Teach.Equal(27.00m, Money.LineTotal(10m, 3, 10m),
            "A 10% discount off 30 is 27. discountPercent is a percentage, not a fraction.");

        Teach.Equal(0.13m, Money.LineTotal(0.25m, 1, 50m),
            "Half of 0.25 is 0.125, exactly on the halfway line. Math.Round's default rounds "
                + "that to the even neighbour, 0.12; this method must round away from zero to "
                + "0.13 - reread README ex4.");

        Teach.Equal(0m, Money.LineTotal(19.99m, 0, 0m),
            "Zero of something costs nothing. No special case needed - the arithmetic already "
                + "says so.");
    }

    [Fact]
    public void Challenge_FormatParsesAndReformatsALine()
    {
        Teach.Equal("widget x3 = $59.97", ReceiptLine.Format("widget|19.99|3"),
            "Split on '|', parse the middle field as a decimal and the last as an int, then "
                + "rebuild the line - reread README challenge.");

        Teach.Equal("cable x4 = $10.00", ReceiptLine.Format("cable|2.5|4"),
            "The money is always printed with two decimal places, so 10 prints as \"10.00\". "
                + "A plain interpolation of the decimal would print \"10.0\" - use a format string.");

        Teach.Equal("mat x3 = $0.30", ReceiptLine.Format("mat|0.1|3"),
            "0.1 x 3 is exactly 0.30 in decimal, and prints with both decimal places.");
    }

    [Fact]
    public void Review1_SummarizeMixesNullChecksAndRounding()
    {
        Teach.Equal("kiln: 21C", SensorRow.Summarize("kiln", 20.5),
            "20.5 rounds away from zero to 21 - the same MidpointRounding decision as ex2.");

        Teach.Equal("sensor: 20C", SensorRow.Summarize(null, 20.4),
            "A missing label becomes \"sensor\"; 20.4 is nowhere near a halfway case and rounds "
                + "down to 20.");

        Teach.Equal("kiln: no reading", SensorRow.Summarize("kiln", null),
            "A null double? means there is no temperature to print at all - the whole "
                + "\"21C\" part is replaced.");

        Teach.Equal("sensor: no reading", SensorRow.Summarize("  ", null),
            "Blank label and no reading: both fallbacks at once.");
    }
}
```

In plain English: `Ex1` calls both copy methods with the same starting value of
12 and asserts that only the class version sees the 99. `Ex2` pins truncation
in both directions, the two midpoint cases, and one overflow. `Ex3` walks all
five null combinations. `Ex4` checks exact decimal results, including the
halfway case that separates the two rounding modes. `Challenge` runs three
lines through the formatter, and `Review1` is the spaced-repetition variant.

## The teaching point

In production the value/reference distinction shows up as a rule of thumb you
will hear on every team: **make types that behave like values immutable**. A
`struct` you can mutate through a field, like this lesson's `ReadingValue`, is
a well-known footgun — put one in a `List<T>` and `list[0].Degrees = 5` won't
even compile, because the indexer hands you a copy. Real codebases declare
`readonly struct` for small value-like things (money, coordinates, dates) and
`class` for everything with identity and a lifecycle (an order, a customer, a
connection). Lesson 06 gives you the modern tools for both.

The other production habit is the one ex4 drills: pick the numeric type by what
the number *means*, not by what is convenient. Money is `decimal`, measurements
and physics are `double`, counts and IDs are `int` or `long`. Every codebase
that stores money in a `double` eventually files a bug titled "invoice is off
by one cent".

Next: **02_control_flow_methods**, where the method you have been filling in
grows parameters that can hand results back, defaults, and a `switch` that
returns a value.
