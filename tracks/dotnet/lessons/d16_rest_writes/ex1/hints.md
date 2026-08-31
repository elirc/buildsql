## Hint 1

The write itself is already correct - the row is saved. What is wrong is what
the response says about it. Two things are missing: the status that means "a
new thing now exists", and the address of that thing.

## Hint 2

`TypedResults.Created($"/d16/jobs/{job.Id}", D16Queue.ToDto(job))` sets both the
status and the `Location` header in one call.

It has to come *after* `SaveChangesAsync`: `job.Id` is 0 until the insert runs,
so a Location built earlier points at `/d16/jobs/0`.
