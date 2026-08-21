## Hint 1

Four outcomes, four guards, and the *order* is the exercise. Write the four
questions out as English sentences before you write any C#, then ask yourself
which one has to be answered first for the other answers to make sense.

A hint about that: two of the four questions cannot even be asked until you
know the order exists.

## Hint 2

Outside in. Does the resource exist? Then: is the payload legal? Then: does the
current state permit the change?

Each check gets its own early return, so the happy path at the bottom is a
single line — and the only thing left to say there is "done, nothing to
report", which is a status code with no body.

`TypedResults.Conflict()` is the 409.

## Hint 3

The skeleton is:

```csharp
var order = Catalog.Orders.FirstOrDefault(/* … */);
if (order is null) { return /* … */; }
if (/* the status is missing or not in Catalog.Statuses */) { return /* … */; }
if (/* the order is already cancelled */) { return /* … */; }
return /* … */;
```

`request.Status` is `string?`, so the second guard has to survive a null before
it calls `Contains`. And the last line returns *no body at all* — the gate reads
the response text and expects it to be empty.
