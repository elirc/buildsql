## Hint 1

Both sides of the transfer change, and both changes belong to one
`SaveChangesAsync` — that is the unit of work, and it is what makes the transfer
atomic without you writing a transaction.

The order of the checks is the part the gate is really testing.

## Hint 2

Check the amount, load both members, check they exist, check the balance — and
only then touch either entity:

```csharp
sender.Credits -= request.Credits;
receiver.Credits += request.Credits;

int changed = await db.SaveChangesAsync();
```

`SaveChangesAsync` returns the number of rows it wrote, so `changed` is 2.

Assigning before the balance check and returning a 400 afterwards leaves the
change tracker holding an edit you did not mean. It happens not to be written
here, because the context dies with the request — but that is luck, not design.

## Hint 3

The four outcomes, in order: non-positive amount → 400; either member missing →
404; sender cannot afford it → 400; otherwise move and save.

Worth thinking about once it passes: two transfers from Ada at the same instant
both read 120, both subtract, and one of them is lost. The answer is optimistic
concurrency — a `[Timestamp]` rowversion column and a
`DbUpdateConcurrencyException` you handle — and "how would you make this safe
under load" is the standard follow-up to this exact question.
