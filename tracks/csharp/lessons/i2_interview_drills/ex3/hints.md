## Hint 1

Four steps, in this order: get the words out of the text, normalise their case,
count them by word, then order and take.

The step people rush is the first one. "Split on spaces" leaves punctuation
stuck to words — `"fox!"` and `"fox"` become two different entries, and the
counts are quietly wrong.

## Hint 2

The tidiest way to say "runs of letters":

```csharp
Regex.Matches(text, "[a-zA-Z]+").Select(m => m.Value.ToLowerInvariant())
```

(A `foreach` over the characters building words in a `StringBuilder` is equally
correct and is what to write if the interviewer bans regex.)

Then it is lesson 11's grouping: `GroupBy(word => word)`,
`OrderByDescending(g => g.Count())`, `ThenBy(g => g.Key)`, `Take(count)`,
`Select` into `"word: n"`.

## Hint 3

The tie-break is the part interviewers actually check. Without
`ThenBy(g => g.Key)` the order of equally-frequent words is whatever `GroupBy`
happened to produce, which makes the output unstable between runs and untestable
— the same "ORDER BY needs a unique tiebreaker" rule as SQL.

Be ready for the follow-up: *"how would this handle a 10 GB file?"* The answer
is that you would stream it — read line by line, accumulate into the dictionary
— because the counts fit in memory even when the text does not. And *"what about
a distributed version?"* is map-reduce, which is this algorithm with the
grouping done in parallel.

Left to you: whether apostrophes should split words. The specification here says
yes (any non-letter separates), which is why `"Don't"` counts as two. Real
products disagree; the point is to notice and ask.
