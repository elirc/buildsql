## Hint 1

This is ex2's running-maximum loop with strings instead of numbers, wearing
ex2's `Try...`/`out` shape. The thing you compare is not the word but its
length.

The tie-break rule is the same one the challenge asked about, so the comparison
operator is the same one.

## Hint 2

`sentence.Split(' ', StringSplitOptions.RemoveEmptyEntries)` gives you the
words and drops the empty strings that runs of spaces would otherwise produce.
Without that option, `"a  b"` splits into three pieces, one of them `""`.

Assign `longest` before any branch — `""` is a good starting value, because
every real word is longer than it, which quietly removes the need for a
separate "first word" case.

## Hint 3

```csharp
longest = "";
string[] words = /* split */;
if (words.Length == 0) { return false; }

foreach (string word in words)
{
    // keep it if it beats what you have
}
return true;
```

If you seeded `longest` with `""` you can drop the length check inside the
loop's first iteration entirely — but you still need the `words.Length == 0`
guard, because a sentence of pure whitespace has to return false rather than
report `""` as the winner.
