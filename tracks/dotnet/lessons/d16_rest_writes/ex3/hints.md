## Hint 1

PUT declares the resource's whole new state. A `status` that is missing from
the body is missing from the resource, so it becomes the default `"queued"` -
not the value that happened to be there before.

## Hint 2

Compute the three values into locals first (`title` trimmed, `copies`,
`status` defaulted to `"queued"`), collect the failures into a
`Dictionary<string, string[]>` keyed `"title"` / `"copies"` / `"status"`, and
return `TypedResults.ValidationProblem(errors)` when it is non-empty.

## Hint 3

The last gate check is that job 1 is untouched after all three rejections. If it
fails, your handler is assigning to the tracked entity before it decides -
EF has already staged the change, and the next `SaveChanges` in the request
writes it. Do every check before the first assignment.
