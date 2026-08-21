# Reading - csharp/01_types_variables

## Notes

**The stack and the heap, at the level worth caring about.** The usual
one-liner is "value types live on the stack, reference types live on the heap",
and it is close enough to be useful and wrong often enough to be worth
correcting. What is actually true: a *local variable* of value type holds its
data inline, wherever that variable lives. If the variable is a local, that is
the stack frame. If it is a field of a class, it lives inside that class's
object — on the heap, embedded in it. An `int[]` of a million ints is one heap
object holding a million inline ints, not a million boxes. So the honest
version is: **value types are stored where they are declared; reference types
are stored as an arrow to somewhere else.** In an interview, say that, then say
"and the stack/heap answer is the usual shorthand" — it demonstrates you know
the difference between a model and a rule.

**Passing to a method is assignment.** Every parameter in C# is assigned from
the argument, so parameter passing follows exactly the same rule as `=`. A
struct argument is copied; a class argument copies the arrow, so the method can
mutate the object you handed it but cannot make your variable point somewhere
else. That last clause is the one people miss: reassigning a reference
parameter inside a method (`order = new Order();`) changes nothing for the
caller. Lesson 02's `ref` is the keyword that changes it.

**Boxing, in one paragraph, because it will come up again.** If you assign a
value type to a variable of type `object` (or of an interface type it
implements), the runtime allocates a heap box and copies the value into it.
That is *boxing*, and it is a real allocation with a real cost in hot loops. It
also copies, so mutating the value afterwards leaves the box unchanged. You
will meet this properly in `06_structs_records` and again in
`i1_interview_concepts`, where it is a [***] question.

**Nullable reference types are compile-time only.** `string?` and `string`
compile to exactly the same IL; the annotation drives a compiler analysis and
nothing else. Nothing stops a badly-behaved library, a reflection call, or a
deserialiser from putting a null in a non-nullable field at runtime — which is
why library authors still write argument checks. `int?`, by contrast, is a real
struct (`Nullable<int>`) with real runtime behaviour. Same punctuation, two
completely different mechanisms, and interviewers love asking you to tell them
apart.

## ex1

The two methods have identical bodies and different answers, which is as close
as a language gets to an experiment you can run. The struct version copies six
bytes and mutates the copy; the class version copies a pointer, so `copy` and
`original` are two names for one object.

What makes this worth doing by hand instead of reading: the code contains no
hint about which one you are getting. There is no `&`, no `*`, no `clone()`,
nothing at the call site at all. The behaviour is a property of the *type*, and
it was decided by whoever wrote `struct` or `class` — possibly years ago, in
another file. That is exactly why the question "is this a value type or a
reference type?" has to be reflexive, and why the .NET framework documents it
prominently for every type it ships.

The follow-up an interviewer will ask: "So is `string` a value type or a
reference type?" `string` is a *reference* type that is *immutable*, so it
behaves like a value in the ways you notice (you cannot mutate someone else's
string) but copies like a reference (assigning is cheap regardless of length).
That combination is deliberate and is why `==` on strings compares text rather
than arrows — the one operator overload that trips up people coming from Java.

## ex2

Three conversions, three different mechanisms, and it is worth naming them.

`(int)someDouble` is a *conversion operator* built into the language. It
truncates toward zero, which means it is `Math.Truncate`, not `Math.Floor`:
they agree for positive numbers and disagree for negative ones, and the day
that difference matters is the day you are computing a negative offset.

`Math.Round`'s default is **banker's rounding** (`MidpointRounding.ToEven`),
which sends 2.5 to 2 and 3.5 to 4. This is not a bug and not a .NET quirk — it
is IEEE 754's default, and it exists because always rounding halves up biases a
long series of sums upward. It is also, reliably, a surprise, so pass the mode
explicitly whenever a human is going to check your arithmetic with a
calculator.

`SafeAdd` is about *where the arithmetic happens*. C# picks the operator
overload from the operand types, so `int + int` is int addition, which wraps
silently on overflow; the widening to `long` happens afterwards, to a value
that is already wrong. Cast one operand and the compiler picks `long + long`
instead. C# also has a `checked` context that turns overflow into an
`OverflowException` — worth knowing it exists, and worth knowing it is off by
default for performance.

## ex3

The two `?`s in `Describe(string? name, int? age)` look like one feature and are
two. `string?` is an annotation: it changes the compiler's flow analysis and
nothing about the generated code. `int?` is `Nullable<int>`, an actual struct
with a `bool` and an `int` inside it, and `age.Value` on an empty one throws.

The blank-string case is there because `null` and `""` and `"   "` are three
different values that mean the same thing to a human, and a nullable annotation
only protects you from one of them. `string.IsNullOrWhiteSpace` is the standard
answer, and it carries a `[NotNullWhen(false)]` attribute that tells the
compiler's null analysis "if this returned false, the argument is not null" —
which is why the `else` branch does not warn. Attribute-driven null analysis is
a small thing that makes the whole feature usable.

The related operators worth having at your fingertips: `??` (fallback if null),
`??=` (assign if currently null), and `?.` (call only if not null, result is
nullable). `name?.Trim() ?? "anonymous"` is idiomatic C# and reads exactly as
it behaves.

## ex4

`decimal` is a 128-bit type storing a 96-bit integer, a sign, and a base-10
exponent from 0 to 28. That representation is what makes `0.1m` exact where
`0.1` (double) is not. It also means `decimal` carries *scale*: `27m` and
`27.00m` are equal but not identical — `ToString()` prints them differently
because the trailing zeros are stored. That is a feature for money, where "$27.00"
is the correct rendering, and a small surprise the first time you see it in a
log.

The rounding call takes three arguments for a reason: value, digits, mode. Skip
the mode and you have silently chosen banker's rounding for someone's invoice.
Skip the rounding entirely and you get a total with four decimal places that
disagrees with the printed receipt by a fraction of a cent — the classic
accumulating-error bug, where each line is nearly right and the sum is visibly
wrong.

One more habit: do the rounding once, at the end, on the value you are about to
show or store. Rounding intermediate values is how you end up with a total that
does not equal the sum of its parts.

## challenge

Parsing and formatting are the two places a program touches the outside world,
and both are culture-sensitive. `decimal.Parse("19.99")` on a machine set to
German reads a *thousands* separator and can hand you 1999, and
`total.ToString("0.00")` there writes `19,99` — so the round trip that works on
your laptop breaks on a colleague's, or on a server set to a different locale.
`CultureInfo.InvariantCulture` says "use the machine-readable convention,
regardless of who is looking", and it is the right answer for anything that
crosses a wire, a file, or a test assertion. Its opposite number,
`CultureInfo.CurrentCulture`, is right when the string is being *shown to a
human*.

The format string `"0.00"` is a custom numeric format: `0` means "a digit, and
a zero if there isn't one". The standard alternative is `"F2"` (fixed-point,
two decimals). Both are worth recognising; neither is worth memorising beyond
that.

## review1

This one folds three of the lesson's ideas into one method: the null fallback,
the nullable value type's `HasValue`, and the rounding mode. It also changes
the *shape* of the output when a value is missing rather than substituting a
different value, which is why an early `return` reads better than a conditional
expression — the two branches are not two values, they are two sentences.

If this came back to you cold and the rounding mode was the part you had to
look up, that is the expected outcome and exactly what the spaced-review ladder
is for. If the `double?` unwrapping was the part you had to look up, reread the
ex3 notes above: the annotation and the wrapper type look alike and behave
differently, and that confusion is durable.

## Further reading

- [Value types (C# reference)](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types) — the official statement of what a value type is, including the list of built-in ones.
- [Reference types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/reference-types) — the other half, and where `string`'s special status is spelled out.
- [Casting and type conversions](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/types/casting-and-type-conversions) — implicit, explicit, and user-defined conversions in one page.
- [Nullable reference types](https://learn.microsoft.com/en-us/dotnet/csharp/nullable-references) — what the annotations mean, and the honest list of what they do not guarantee.
- [`decimal` keyword](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/floating-point-numeric-types) — precision, range, and the `m` suffix, next to `float` and `double` for comparison.
- [`MidpointRounding` enum](https://learn.microsoft.com/en-us/dotnet/api/system.midpointrounding) — all the modes, with the banker's-rounding rationale.
