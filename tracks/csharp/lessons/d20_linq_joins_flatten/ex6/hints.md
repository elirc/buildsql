## Hint 1

A join key does not have to be one field. Both key selectors just have to
return the same type, and a value tuple is the cheapest type that holds two
strings:

```csharp
booking => (booking.Day, booking.Room)
shift   => (shift.Day, shift.Room)
```

Do not build the key by concatenating the two strings.

## Hint 2

Tuples get structural equality and a matching hash code for free, which is
exactly what a key needs. `booking.Day + booking.Room` looks equivalent and is
not - `"Mo" + "nA"` and `"Mon" + "A"` are the same string, so two different
pairs would silently join. Records and anonymous types work for the same reason
tuples do.

Expect the multiplication: two shifts cover Mon/A, so each Mon/A booking
produces two rows. A join is not a lookup. If you want one row per booking,
that is a different query and a decision about which nurse to pick.

## Hint 3

`Uncovered` is the complement, and a join will not give it to you directly -
`Join` produces rows for matches, and you want the bookings with none.

Two routes. The tidy one is a `HashSet` of the shift keys and a `Where` that
asks whether it contains the booking's key; the other is a `GroupJoin` and a
`Where` on the empty groups. The set is O(1) per booking and reads as what it
means. Whichever you pick, note that a *shift* with no booking is not reported:
this report is about bookings, and the other direction needs the query run the
other way round.
