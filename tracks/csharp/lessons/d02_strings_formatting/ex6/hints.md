## Hint 1

Scan the template once with an index and a `StringBuilder`. At each position
you are in one of two situations: the character is not a `{`, so copy it; or it
is, so look for the matching `}` and decide what to emit.

`string.IndexOf('}', startIndex)` finds the close brace and returns -1 when
there is none - which is the "ordinary text" case.

## Hint 2

The three outcomes at a `{`:

1. no `}` after it - append the rest of the template and stop;
2. a `}` and the key is known - append the value;
3. a `}` and the key is unknown - append the token *including both braces*.

Case 3 is the one people get wrong, and it is the one that matters: silently
dropping an unknown token turns a typo into a missing word nobody notices.

`template.Substring(index + 1, close - index - 1)` is the key. Work that
arithmetic out on paper once with `"{a}"` - index 0, close 2 - rather than
guessing.

`values.TryGetValue(key, out string? replacement)` asks and fetches in one
lookup; `ContainsKey` followed by the indexer does the work twice.
