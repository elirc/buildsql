## Hint 1

Two disciplines at once, and both are all-or-nothing. Every problem in the whole
payload is reported in one response, and if there is even one, no row is
written - not even for the items that were fine.

## Hint 2

Build one `Dictionary<string, string[]>` and keep adding to it: `"reference"`,
`"items"`, and then a `for` loop over the items adding `$"items[{i}].title"` and
`$"items[{i}].copies"`. Only after the loop does it decide whether to return
`TypedResults.ValidationProblem(errors)`.

Do not return inside the loop - a client with four bad rows deserves to hear
about four bad rows.

## Hint 3

For the write, hang the jobs off the batch rather than saving twice:

    var batch = new Batch { Reference = reference, Jobs = items.Select(...).ToList() };
    db.Batches.Add(batch);
    await db.SaveChangesAsync();

One `SaveChanges` inserts the batch and its jobs, and EF fills in each
`BatchId` and each `Job.Id` - which is where the `jobIds` in the response come
from. `Location` points at `/d16/batches/{id}`, the resource that was created,
and `GET /d16/batches/{id}` has to resolve it.
