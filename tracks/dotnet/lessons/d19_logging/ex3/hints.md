## Hint 1

`ILogger` has an overload whose FIRST argument is the exception:

    logger.LogError(ex, "Label render failed for pick {PickId}", pick.Id);

Concatenating `ex.Message` into the text keeps one string and throws away the
type, the stack trace and every inner exception.

## Hint 2

The other half is the response. `detail: ex.Message` puts the printer's spool
token in the body - the gate greps for it. Everything you know about the
exception goes to the log; the client gets a sentence that names nothing.
