# Reading - csharp/00_hello_dojo

The loop you just ran — write, grade, read the evidence — is the whole course.
This page is the other half of every lesson: the *why* behind the problems you
just solved. It is meant to be read **after** you attempt a problem, whether
the gate went green or red. Failing first and reading second is not a
consolation prize; it is the version of studying that actually sticks.

## Notes

**What actually happened when you ran the gate.** `dojo test csharp` shells
out to `dotnet test`, which does four things in order: restores NuGet
packages, compiles `src/Lessons` into `Lessons.dll`, compiles `tests/Gates`
into `Gates.dll` (which references the first), and then hands the test
assembly to the xUnit runner. Two of those four steps are a *compiler*, which
is why C# feedback feels different from JavaScript feedback: a typo in a
method name is caught before a single test runs, and the error names a file
and a line. This is the trade — a slower loop that catches a larger class of
mistakes without you having to think of a test for them.

**Static, and why almost everything in this lesson is.** A `static` member
belongs to the type; an instance member belongs to an object you have to
create first. `Greeter.Greet("Eli")` works without `new Greeter()` because
`Greet` is static. Static is the right default for a pure function of its
arguments — no state to hold, nothing to configure — and the wrong default for
almost everything else, which is why `03_classes_objects` will spend a whole
lesson on the alternative. If it helps: `Math.Max` is static, your
`OrderService` should not be.

**Namespaces are for organisation, not access control.** `namespace CSharpDojo.L00_HelloDojo;`
at the top of your files means their full names are
`CSharpDojo.L00_HelloDojo.Greeter` and so on, and the gate reaches them with a
`using CSharpDojo.L00_HelloDojo;` line. Namespaces do not restrict anything —
that is what `public`/`internal`/`private` are for. They exist so that two
libraries can both define a `Logger` without a fight, and in this course so
that one lesson's `TrackInfo` cannot collide with another's. Note the trailing
semicolon: that is the modern *file-scoped* namespace form, which saves you a
level of indentation over the older braced version you will see in older code.

**Nullable reference types are on.** `<Nullable>enable</Nullable>` in
`Lessons.csproj` means `string` promises not to be null and `string?` admits
it might be. The compiler then warns when you dereference something that could
be null. It is a warning, not an error, and it is not enforced at runtime —
which makes it much weaker than C#'s value/reference distinction but much
better than nothing. `01_types_variables` covers it properly.

## ex1 — your first method

The interesting part of this exercise is how little of it is C#. The body is
one `return` of one interpolated string; the same three lines in JavaScript,
Python or Ruby would look almost identical. What is different is everything
*around* the body: the return type you were given, the `static` you didn't
have to think about, the fact that a missing `$` on the string literal is a
compile error and not a silently wrong value.

The classic beginner mistake here is `"Hello, {name}!"` without the `$`.
Nothing fails to compile — that is a perfectly good string containing braces —
so the first time you find out is when the gate prints the expected and actual
side by side and you see your literal braces staring back. Getting caught by
that once is worth more than reading about it three times.

## ex2 — a decision the compiler cannot make for you

Pluralisation is a deliberately unglamorous problem, chosen because it splits
cleanly into "what the type system guarantees" and "what it doesn't". The
types guarantee you were handed a `string` and an `int` and must hand back a
`string`. They have nothing whatsoever to say about whether `0` is plural.
Type systems eliminate a *category* of mistakes — wrong shape, wrong
conversion, null where a value was assumed — and leave logic entirely to you
and your tests.

The classic mistake is `lessons > 1 ? "lessons" : "lesson"`, which is right for
14, right for 1, and wrong for 0. English pluralises on "is it exactly one",
so the condition to write is `lessons == 1`. Interviewers use almost exactly
this question — usually as "render '1 file' / '2 files'" — precisely because
the zero case separates people who tested their function from people who
eyeballed it.

For the record, real applications do not hand-roll this: .NET has
`System.Globalization` and localisation frameworks for it, because plural
rules in Polish and Arabic are not a ternary. Knowing that the naive version
is naive is enough for now.

## ex3 — text in, number out

`Split('_')` returns a `string[]`, and `[0]` takes the first element — which
is where the "first segment, not everything before the last one" rule comes
from. `"13_async_await".Split('_')` is `["13", "async", "await"]`, so index 0
is `"13"` no matter how many underscores follow.

Converting that to an `int` is where C# offers you a genuine choice, and it is
worth knowing all three now because they come up in interviews.
`int.Parse(text)` throws a `FormatException` if the text is not a number.
`int.TryParse(text, out int value)` returns a `bool` and never throws.
`Convert.ToInt32(text)` throws too, but maps `null` to `0` rather than
throwing. The rule of thumb professionals use: `Parse` when malformed input is
a *bug* and you want the loud failure, `TryParse` when malformed input is
*expected* and you have a plan for it. Here the slugs come from the course's
own directory names, so a bad one is a bug, and `Parse` is the honest choice.

Two smaller notes. `int.Parse("00")` is `0` — leading zeros are just digits,
and there is no octal surprise in C# the way there historically was in
JavaScript's `parseInt`. And the return type doing real work: had you tried to
`return slug.Split('_')[0];` the compiler would have stopped you with
"cannot implicitly convert type 'string' to 'int'". In a language that
inferred the return type, that same mistake would have compiled and failed
later, somewhere else.

## Further reading

- [A tour of C#](https://learn.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/) — Microsoft's official overview. Read the first three pages now; the rest becomes useful around lesson 05.
- [String interpolation in C#](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/tokens/interpolated) — the `$""` form, including alignment and format specifiers you will want later.
- [`int.Parse` vs `int.TryParse`](https://learn.microsoft.com/en-us/dotnet/api/system.int32.tryparse) — the API page, and the standard example of the "throw or return false" design question.
- [C# coding conventions](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/coding-style/coding-conventions) — naming, braces, `var` usage. Skim it once; this course follows it, and so does every team you will join.
- [Nullable reference types](https://learn.microsoft.com/en-us/dotnet/csharp/nullable-references) — what `<Nullable>enable</Nullable>` bought you, and what it deliberately did not.
