# Reading - csharp/d02_strings_formatting

## Notes

The thread running through all eight problems is that **a `string` in .NET is
an immutable sequence of UTF-16 code units, and almost every question you can
ask about one has more than one defensible answer** - so the API makes you
choose. Which culture formats this number? Which comparison decides these two
names are equal? Does a run of separators collapse or not?

The everyday consequence of immutability is that concatenation in a loop is
quadratic and `StringBuilder` is not a micro-optimisation. The everyday
consequence of "more than one answer" is that any string method with a
`StringComparison` or `IFormatProvider` overload has a wrong default waiting
for you when your code meets a machine in another locale. Reach for the
explicit overload by reflex; the drills here are mostly about building that
reflex.

## ex1

Really testing: that the field width is a promise about the *result*, not about
the input. The classic mistake is `text.Substring(0, width) + "..."`, which
produces a string of `width + 3` characters and silently breaks the column
alignment the whole point of the method was to maintain. The model answer
subtracts the ellipsis from the budget before truncating. `Center` hides a
smaller version of the same discipline: the odd space has to go somewhere, the
specification says right, and `padding / 2` on the left with `padding - left`
on the right encodes that without a conditional.

## ex2

Really testing: that formatting is a lookup, not a construction. Everything
asked for here is one standard or custom specifier plus
`CultureInfo.InvariantCulture`. The classic mistake is building the output by
hand - `Math.Round` then `ToString()` then inserting commas - which is longer,
slower and wrong on the first machine whose locale uses `.` as a group
separator. The percentage case teaches the other half: the built-in `"P1"`
specifier exists but inserts a culture-specific space before the sign, so the
model answer multiplies by 100 and uses `"0.0"`. Knowing *why* you did not use
the obvious specifier is the senior version of this answer.

## ex3

Really testing: that real delimited data has ragged whitespace and empty
fields, and that both directions need the same filter. The classic mistake is
filtering on one side only, so a round trip through `Join` and `Split` is not
the identity. `string.IsNullOrWhiteSpace` is the single call that covers null,
empty and spaces, and it carries a `[NotNullWhen(false)]` annotation so the
compiler stops warning about the `Trim()` inside the `if` - a small example of
nullable annotations doing real work.

## ex4

Really testing: whether you reach for `StringBuilder` without being told, and
whether you can get "separator between items" right. The classic mistake is
appending the separator after each item and then trimming the last one off -
which works, allocates an extra string, and reads like an apology. Appending
the separator *before* every item except the first has no cleanup step. The
negative-count case exists to show that a `for` loop already handles it: a
guard clause there would be code that can never run, and code that can never
run still has to be read.

## ex5

Really testing: that "equal" is a question with several correct answers and
that C# makes you pick one. `==` is ordinal and case-sensitive; culture-aware
comparison sorts differently in different places; `OrdinalIgnoreCase` is the
right default for identifiers. The classic mistake is
`a.ToLower() == b.ToLower()`, which allocates two strings per comparison and is
locale-dependent into the bargain. The null handling is not defensive
programming: names arrive null from databases constantly, and `a.Trim()` on a
null is the `NullReferenceException` in your log at 3am.

## ex6

Really testing: single-pass scanning with an index, and the judgement call
about unknown tokens. The classic mistake is a `Replace` per dictionary entry,
which is O(keys x length), rewrites the string once per key, and cannot tell an
unknown token from ordinary text. The model answer walks the template once,
and at each `{` asks only two questions: is there a `}`, and is the key known.
Leaving an unknown token visible is the deliberate part of the design - a
renderer that drops what it does not recognise turns `{nmae}` into a blank
space that ships to a customer.

## ex7

Really testing: a greedy algorithm with an explicit invariant - "the buffer
always holds a line that fits". Splitting on whitespace first removes an entire
category of edge case, which is a habit worth generalising: normalise the input
so the loop only has one job. The classic mistake is forgetting the `+ 1` for
the space you are about to add, producing lines one character too wide; the
second is forgetting to flush the buffer after the loop, silently losing the
last line. Note that the over-long word needs no special case: the buffer is
empty, so the word starts the line, and the next word does not fit.

## ex8

Really testing: collapsing runs, which is the same shape as de-duplicating
adjacent items, and is best solved with a "separator owed" flag rather than by
post-processing. The classic mistake is `Regex.Replace(title, "[^a-z0-9]+",
"-")` followed by `Trim('-')` - which is not wrong, and is a perfectly good
answer if you can say why the `+` matters and why the trim is still needed. The
mistake proper is the version without the `+`, which produces `"hello--world"`
from a comma and a space. The lower-casing is invariant for the same reason as
ex5: a slug is machine data, and it must not change when the process starts on
a machine in Ankara.

## Further reading

- [`string` and string literals](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/strings/) - immutability, interpolation, raw literals.
- [Standard numeric format strings](https://learn.microsoft.com/en-us/dotnet/standard/base-types/standard-numeric-format-strings) - `N`, `X`, `P` and the rest, with examples.
- [Custom numeric format strings](https://learn.microsoft.com/en-us/dotnet/standard/base-types/custom-numeric-format-strings) - what `0.0` and `#.##` actually mean.
- [Comparing strings](https://learn.microsoft.com/en-us/dotnet/standard/base-types/comparing) - which `StringComparison` to use, with a decision table.
- [`StringBuilder`](https://learn.microsoft.com/en-us/dotnet/api/system.text.stringbuilder) - the API and when it stops being worth it.
- [Globalization and localization best practices](https://learn.microsoft.com/en-us/dotnet/core/extensions/globalization-and-localization) - why invariant is the default for machine data.
