@@PROMPT@@
## Exercise 8 - parsing without the garbage

Edit `src/Lessons/V3CC01_GcGenerations/Ex8.cs`.

A settings line looks like `"host=db1;port=5432;mode=fast"`. Parse it with
spans.

- `SettingsReader.CountPairs(ReadOnlySpan<char> text)` — how many `key=value`
  pairs there are, allocating **nothing**. An empty span is `0`; empty
  segments (`"a=1;;b=2"`) are skipped; a segment with no `=` is skipped.
- `SettingsReader.FindValue(ReadOnlySpan<char> text, ReadOnlySpan<char> key)` —
  returns the value as a `string`, or `null` when the key is absent. Exactly
  one string is allocated on a hit and none on a miss. Keys are compared
  ordinally, case sensitively. The first match wins.
- `SettingsReader.TryFindValue(ReadOnlySpan<char> text, ReadOnlySpan<char>
  key, out ReadOnlySpan<char> value)` — the zero-allocation form the other two
  build on.

```
CountPairs("host=db1;port=5432")        -> 2
CountPairs("a=1;;b=2;oops")             -> 2
FindValue("host=db1;port=5432", "port") -> "5432"
FindValue("host=db1", "user")           -> null
FindValue("k=", "k")                    -> ""
```

The gate measures allocations: `CountPairs` and a miss must allocate zero
bytes, and a hit must allocate no more than the value string itself.

```
uv run dojo test csharp v3cc01_gc_generations ex8
```
@@HINTS@@
## Hint 1

`text.Split(';')` is the instinct and it is the thing being trained out of
you: it allocates an array plus a string per segment before you have decided
whether you need any of them. Everything here is `IndexOf` plus `Slice` on the
span you were handed.

## Hint 2

The walk, in the shape you want:

```csharp
while (!remaining.IsEmpty)
{
    int end = remaining.IndexOf(';');
    ReadOnlySpan<char> segment = end < 0 ? remaining : remaining[..end];
    remaining = end < 0 ? default : remaining[(end + 1)..];
    // ... look at segment ...
}
```

`ReadOnlySpan<char>` supports range syntax, and `remaining[..end]` copies
nothing — it is a new view over the same characters.

## Hint 3

Write `TryFindValue` first and let the other two lean on it: `FindValue` is
`TryFindValue(...) ? value.ToString() : null`, and `ToString()` on a span is
the one allocation the contract allows. The decision left to you is what
`SequenceEqual` versus `Equals(..., StringComparison.Ordinal)` buys you for
the key comparison — one of them is doing exactly what you asked and the other
is doing slightly more.
@@IMPORTANT@@
## Hint 1

A `ReadOnlySpan<char>` over a string is a reference plus a length. Slicing it
changes the two numbers and touches no memory, which is why the whole parse
can be free. The cost only appears when you materialise something the caller
can keep — a `string`, an array, a list.

## Hint 2

Spans are `ref struct`s and that constrains the code you can write around
them. All of these are compile errors, on purpose:

```csharp
class C { ReadOnlySpan<char> field; }              // no: may not be a field
async Task M(ReadOnlySpan<char> s) { await ...; }  // no: may not cross an await
var f = () => span.Length;                          // no: may not be captured
```

Because a span may point at stack memory, the compiler refuses to let it
outlive its frame.

## Hint 3

The empty and malformed cases are where the marks are. Decide what
`"a=1;;b=2"` means (an empty segment, skipped), what `"oops"` means (no `=`,
skipped), and what `"k="` means (present with an empty value, which is *not*
the same as absent). Write those three down before you write the loop, and the
loop writes itself.
@@REF@@
// v3cc01_gc_generations / ex8 - parsing without the garbage.
// See lessons/v3cc01_gc_generations/README.md, "Exercise 8".

namespace CSharpDojo.V3CC01_GcGenerations;

/// <summary>
/// Reads "key=value;key=value" without allocating: spans are a reference and
/// a length, so slicing is arithmetic, not copying.
/// </summary>
public static class SettingsReader
{
    public static int CountPairs(ReadOnlySpan<char> text)
    {
        int count = 0;
        ReadOnlySpan<char> remaining = text;

        while (!remaining.IsEmpty)
        {
            ReadOnlySpan<char> segment = NextSegment(ref remaining);
            if (!segment.IsEmpty && segment.IndexOf('=') >= 0)
            {
                count++;
            }
        }

        return count;
    }

    /// <summary>
    /// The zero-allocation core: hands back a view over the caller's text.
    /// </summary>
    public static bool TryFindValue(
        ReadOnlySpan<char> text,
        ReadOnlySpan<char> key,
        out ReadOnlySpan<char> value)
    {
        ReadOnlySpan<char> remaining = text;

        while (!remaining.IsEmpty)
        {
            ReadOnlySpan<char> segment = NextSegment(ref remaining);
            int split = segment.IndexOf('=');
            if (split < 0)
            {
                continue;
            }

            // SequenceEqual is an ordinal, length-checked comparison and
            // nothing more - exactly what a settings key deserves.
            if (segment[..split].SequenceEqual(key))
            {
                value = segment[(split + 1)..];
                return true;
            }
        }

        value = default;
        return false;
    }

    /// <summary>
    /// The convenience form. One allocation on a hit - the value - and none
    /// on a miss.
    /// </summary>
    public static string? FindValue(ReadOnlySpan<char> text, ReadOnlySpan<char> key) =>
        TryFindValue(text, key, out ReadOnlySpan<char> value) ? value.ToString() : null;

    private static ReadOnlySpan<char> NextSegment(ref ReadOnlySpan<char> remaining)
    {
        int end = remaining.IndexOf(';');
        if (end < 0)
        {
            ReadOnlySpan<char> last = remaining;
            remaining = default;
            return last;
        }

        ReadOnlySpan<char> segment = remaining[..end];
        remaining = remaining[(end + 1)..];
        return segment;
    }
}
