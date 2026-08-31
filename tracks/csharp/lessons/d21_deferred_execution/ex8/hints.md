## Hint 1

Three questions, one `foreach`. Each question needs one or two variables kept
outside the loop, and the loop updates all of them as each line goes past.

Do not reach for `lines.Count()`, `lines.OrderByDescending(...)` and
`lines.SelectMany(...)` - that is three enumerations, and the source the gate
hands you allows one.

## Hint 2

The three accumulators are a count, the longest line so far, and the words.
For the words you need two collaborating collections:

```csharp
List<string> words = new List<string>();
HashSet<string> seen = new HashSet<string>();
// ...
if (seen.Add(word)) { words.Add(word); }
```

`HashSet.Add` returns false when the item was already there, so one call both
tests and records. The list is what remembers first-seen order, which a set
alone cannot.

Split the line on whitespace with
`line.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries)` - passing a
null separator array means "any whitespace", and the option drops the empty
pieces that runs of spaces would otherwise produce.

The longest-line comparison needs a strict `>` so the first of a tie wins, and
the empty case is the one where you never assigned it at all.
