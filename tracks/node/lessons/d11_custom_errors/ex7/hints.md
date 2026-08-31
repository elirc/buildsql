## Hint 1

Both exports need the same predicate, so write it once: is this an object, is
it not `null`, does it have a **string** `name`, does it have a **string**
`message`?

`typeof null === "object"` is the trap that never stops being a trap. And
checking one field only would make every config object with a `name` an error.

## Hint 2

`isErrorOfType` is that predicate plus a name comparison. It exists because
`instanceof` compares prototype *identity*, and an error that crossed a realm
boundary — a worker thread, a `vm` context, a JSON response revived by somebody
else's code — has a different `Error` constructor entirely. Its prototype chain
never touches yours, so `instanceof` says no about something that is, for every
practical purpose, that error.

## Hint 3

`Symbol.hasInstance` is the hook `instanceof` consults on the **right-hand
side**. Define it as a static method and `x instanceof ErrorLike` calls it with
`x`, returning whatever you say — no prototype chain involved at all.

That is powerful and worth being slightly suspicious of: `instanceof` is
something every reader thinks they understand, and a class that redefines it is
lying to them unless the name makes the intent obvious. `ErrorLike` is about as
honest as such a name gets.

The remaining decision is whether duck typing should also accept a *subclass*
name — an error named `"NotFoundError"` matched against `"HttpError"` is a
different question, and structural checks cannot answer it at all.
