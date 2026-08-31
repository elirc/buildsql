## Hint 1

Four outcomes, four `return`s, and one log call on each path - so decide the
level per outcome rather than per status code. Two of these are 409s and they
do not belong at the same level.

## Hint 2

Ask "whose problem is this?" A caller naming a pick that does not exist, or
scanning an item that is not on the list, is somebody else's mistake:
`LogInformation`. An item the system promised with nothing on the shelf is a
fact about the warehouse that a human should see: `LogWarning`.

Nothing here is `LogError` - the server did not fail at anything. Give each
entry the property the gate asks for (`PickId` or `Sku`).
