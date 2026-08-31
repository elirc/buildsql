## Hint 1

The hard part is not "replace bad characters with hyphens" - it is "a *run* of
bad characters becomes one hyphen, and runs at the ends become nothing". A
naive `Replace` per character gives `"hello--world-"`.

One pass with a flag solves it: instead of emitting a hyphen when you see a
separator, *remember that one is owed* and emit it only when the next keepable
character arrives.

## Hint 2

```csharp
bool pendingSeparator = false;
foreach (char c in title)
{
    if (!IsKeepable(c)) { pendingSeparator = slug.Length > 0; continue; }
    if (pendingSeparator) { slug.Append('-'); pendingSeparator = false; }
    slug.Append(char.ToLowerInvariant(c));
}
```

`slug.Length > 0` in the separator branch is what suppresses a leading hyphen,
and the fact that a pending separator is never flushed after the last keepable
character is what suppresses the trailing one. Both edge rules, one flag.

`char.ToLowerInvariant` rather than `ToLower` for the same reason as ex5: a
slug is part of a URL, not part of a language.

Left to you: whether "keepable" is `char.IsLetterOrDigit` or an explicit
ASCII range test. They differ - `char.IsLetterOrDigit('e')` with an accent is
true, and an accented letter in a URL is a different conversation. Pick one and
know what you picked.
