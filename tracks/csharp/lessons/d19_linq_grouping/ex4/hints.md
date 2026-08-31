## Hint 1

A group key can be anything with sensible equality, and a value tuple qualifies:

```csharp
visits.GroupBy(visit => (visit.Day, visit.Room))
```

The group's `Key` is then the tuple, and `group.Key.Day` and `group.Key.Room`
are both available for the ordering and the text.

Do not concatenate the two strings into one key.

## Hint 2

Tuples get structural equality and a matching hash code for free, which is
exactly what a key needs. `visit.Day + visit.Room` looks equivalent and is not:
`"Mo" + "nA"` and `"Mon" + "A"` are the same string, so two different pairs
would silently share a group. A record or an anonymous type works for the same
reason a tuple does.

For `RoomHoppers`, group by person and then ask each group how many **distinct**
rooms it saw:

```csharp
group.Select(visit => visit.Room).Distinct().Count() > 1
```

Counting the visits instead of the rooms would call anyone with two identical
visits a room-hopper - which is the case the gate builds for bob.
