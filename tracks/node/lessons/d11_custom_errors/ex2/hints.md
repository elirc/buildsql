## Hint 1

Three classes, two levels. The base takes the status; each subclass is a
constructor that calls `super` with its own number and passes the message and
options straight through.

`expose` is a comparison, not a field the caller sets: a 4xx is the client's
fault and its message is safe to return, a 5xx is yours and its message is an
internal detail.

## Hint 2

Two things have to reach `Error` itself.

The message, obviously. And the **options object** — `super(message, options)` —
because that is the only way `cause` gets set. Dropping it is easy to do and
silently breaks every cause chain that passes through your class.

## Hint 3

For `name`, the tidy version is `this.name = new.target.name` in the base
constructor: `new.target` is the constructor that was actually invoked, so each
subclass names itself and no subclass repeats the line.

Writing `this.name = "BadRequestError"` in each subclass also works and drifts
the first time somebody renames a class without renaming the string.

The remaining decision is whether `expose` should be overridable — some
frameworks let a 5xx opt in to exposing its message for a specific case. Say
what you would do and why the default is the safe direction.
