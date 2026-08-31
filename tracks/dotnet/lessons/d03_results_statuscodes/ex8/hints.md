## Hint 1

Three things, and the first unlocks the second: name the GET endpoint, build the
`Location` from that name rather than from a string, and give the duplicate case
a body a client can act on.

The order of checks in the POST is ex4's again — shape first, then state.

## Hint 2

`app.MapGet(...).WithName(RoomRouteName)` is the naming.

`TypedResults.CreatedAtRoute(room, RoomRouteName, new { id = room.Id })` is the
create: value first, then the route name, then the route values that fill the
template.

For the conflict, `TypedResults.Problem(detail:, statusCode:, title:)` with
`StatusCodes.Status409Conflict` gives you the `application/problem+json`
document. `TypedResults.Conflict("…")` would be a 409 with a bare JSON string,
which the gate's content-type check rejects.

## Hint 3

The duplicate check is `store.FindRoom(request.Name)` — the string overload,
which matches case-insensitively, because "kiri" and "Kiri" are the same room to
anyone but a computer.

Order matters here too: reject the blank name *before* you look for a duplicate,
or `FindRoom("")` gets asked a question that means nothing.

Left for you: what the `detail` sentence says. It should name the room that
collided and nothing else — a conflict message is a place people accidentally
leak the contents of a record the caller was not allowed to see.
