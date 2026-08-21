## Hint 1

Validate, then create, then report — lesson 07's create endpoint with one extra
rule.

The extra rule is about a property you must *not* use. Read `NewNote` again and
ask which of its two fields a caller is entitled to decide.

## Hint 2

The validation failure is a ProblemDetails, keyed by field:

```csharp
return TypedResults.ValidationProblem(
    new Dictionary<string, string[]> { ["text"] = ["Text is required."] });
```

For the create, `store.Add(owner, text)` returns the new note with its id. The
`owner` argument is `user.Identity?.Name` — the token — and `request.Owner` is
never read at all. Deleting the temptation is the exercise.

Then `TypedResults.Created($"/l09/notes/{note.Id}", note)`.

## Hint 3

```csharp
if (string.IsNullOrWhiteSpace(request.Text))
{
    return TypedResults.ValidationProblem(/* … */);
}

string owner = user.Identity?.Name ?? "";
var note = store.Add(owner, request.Text);

return TypedResults.Created($"/l09/notes/{note.Id}", note);
```

Worth a comment in your own code saying that `request.Owner` is deliberately
ignored — otherwise the next person to read the file will "fix" it.
