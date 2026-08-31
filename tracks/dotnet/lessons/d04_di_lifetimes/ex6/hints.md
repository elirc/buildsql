## Hint 1

One word changes on one line. Ask what has to be true: the handler and both
repositories are resolved separately during one request and must end up with the
*same* object, and the next request must get a different one.

That is the definition of one of the three lifetimes.

## Hint 2

`AddScoped<IWorkUnit, WorkUnit>()`.

Transient gives each of the three collaborators its own unit, so a change
tracked by one repository is invisible to the other and one `SaveChanges` cannot
commit both. Singleton shares one across concurrent requests, which is worse:
`DbContext` is not thread-safe, so the failure is corruption rather than an
error.

This is the reason `AddDbContext` registers scoped by default, and it is worth
being able to say in one sentence.
