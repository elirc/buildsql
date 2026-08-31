## Hint 1

Resolve the default format first, then reject an unsupported one, then look up
the booking — the same "validate the request before you hunt for the resource"
order as ex4.

Two different result helpers produce the two content types. `TypedResults.Ok`
produces neither of them correctly for the text case.

## Hint 2

`format ?? "json"`, then reject anything that is not `json` or `text` with a 400.

For the text branch, `TypedResults.Text(body, "text/plain")` writes the string
as-is. `TypedResults.Ok(body)` would send `"Booking 1: Ada in Sakura"` — a JSON
string, quotes and all, under `application/json`.

For the JSON branch, `TypedResults.Json(new Receipt(...))` is explicit about what
it is doing; `TypedResults.Ok(receipt)` produces the same bytes.
