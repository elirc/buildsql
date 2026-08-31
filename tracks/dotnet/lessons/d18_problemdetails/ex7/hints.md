## Hint 1

Reading the body by hand means owning the two failures the model binder used to
own. Take `(string code, HttpContext http)` and do it yourself:

    http.Request.ContentType   // must start with application/json, else 415
    await http.Request.ReadFromJsonAsync<PurchaseRequest>()

## Hint 2

`ReadFromJsonAsync` throws `JsonException` on bytes that are not JSON. That is
expected input, not a fault: catch it and answer 400 with the type
`malformed-body`. Letting it reach a `catch (Exception)` that answers 500 tells
the client your server is broken when its own bytes were.

## Hint 3

The order cannot be rearranged, because each step assumes the last one worked:
media type, parse, validate `seats`, then `D18Booking.Reserve` inside ex5's
try/catch.

Keep the two 400s distinguishable - `malformed-body` has no `errors` dictionary,
`invalid-request` does - because a client reacts to them completely differently.
