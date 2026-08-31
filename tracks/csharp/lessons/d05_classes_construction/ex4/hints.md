## Hint 1

The field is `private readonly List<string>`; the property is
`IReadOnlyList<string>`. That pairing is the standard way to own a collection:
the class can add and remove, and callers can only look.

`List<T>` already has `Add`, `Remove` (which returns the bool you want) and
`IndexOf`. Most of this exercise is delegation.

## Hint 2

`_tracks.AddRange(tracks)` copies the incoming sequence rather than storing a
reference to it - which is what the gate's "the caller adds to its own list
afterwards" check is for.

`Tracks => _tracks;` works because `List<T>` implements `IReadOnlyList<T>`. Be
aware of what that does and does not promise: a caller who casts it back to
`List<string>` can still mutate it. `_tracks.AsReadOnly()` returns a genuine
wrapper that cannot, at the cost of an allocation - a real trade-off worth
being able to argue either side of.

`MoveUp` is `IndexOf` plus a swap:

```csharp
int index = _tracks.IndexOf(track);
if (index <= 0) return false;
(_tracks[index - 1], _tracks[index]) = (_tracks[index], _tracks[index - 1]);
```

`index <= 0` covers both the missing case (-1) and the already-first case (0)
in one test - which is neat, and worth a comment in real code so the next
reader does not think it is a bug.
