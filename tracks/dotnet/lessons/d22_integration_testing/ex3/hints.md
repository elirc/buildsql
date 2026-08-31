## Hint 1

Unique and unpredictable are two different requirements, and only one of them
was asked for. An identifier that is a function of its inputs can still be
unique within the host - and unlike a `Guid`, a test can state what it should
be before the request is made.

## Hint 2

Two inputs: the card id from the body and a number from the injected
`ReferenceDesk`. Take a `ReferenceDesk desk` parameter, call `desk.Next()`
once, and build the string. `ToUpperInvariant()` capitalises the card, and the
`:D4` format specifier does the four-digit padding.
