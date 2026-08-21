## Hint 1

Before you type anything, write down what each handler *should* answer for every
input: a good create, a blank title, an unknown id, a good replace, the same
replace again. Five rows. Then compare each with what the code does.

There are five defects and none of them throws.

## Hint 2

The create needs three changes: validate the title, return 201 instead of 200,
and include a `Location` of `/i1/tickets/{id}` built from the id the store gave
back.

The replace needs two: 404 when the ticket does not exist, and 204 on success —
including on a repeat. Delete the "same title means conflict" check entirely.
That is the bug an interviewer is watching for: PUT is idempotent, so sending the
identical request twice is a success both times.

`TypedResults.ValidationProblem(new Dictionary<string, string[]> { ["title"] = [...] })`
is the 400.

## Hint 3

```csharp
var ticket = store.Add(request.Title);
return TypedResults.Created($"/i1/tickets/{ticket.Id}", ticket);
```

and for the replace, in this order: validate the title, then
`if (store.Find(id) is null) return TypedResults.NotFound();`, then
`store.Replace(id, request.Title)` and `TypedResults.NoContent()`.

Checking the payload before the lookup keeps the answer the same whoever sent it.
