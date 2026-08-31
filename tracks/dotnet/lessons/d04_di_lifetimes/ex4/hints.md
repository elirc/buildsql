## Hint 1

Two requirements, and they pull in different directions. Every caller needs its
*own* lease, which rules one lifetime out. And every lease must be handed back
when the request ends, which rules out the one whose scope never ends.

Only one line changes.

## Hint 2

Transient. Each resolution creates a new lease — and, crucially, the **scope
that resolved it** takes ownership and disposes it when the request finishes.

That last part surprises people: transient does not mean the container forgets
about you. It means you get a new instance; if that instance is `IDisposable`,
the resolving scope still owns it.

The consequence worth remembering: a transient `IDisposable` resolved from the
*root* provider is owned by the root scope, which only ends when the process
does.
