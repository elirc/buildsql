## Hint 1

`TypedResults.NotFound()` sends a status and nothing else - no body, no content
type. `TypedResults.Problem(...)` sends `application/problem+json` with the RFC
9457 members filled in.

## Hint 2

    return TypedResults.Problem(
        statusCode: StatusCodes.Status404NotFound,
        title: "No such sailing.",
        detail: $"This operator has no sailing '{code}'.",
        instance: http.Request.Path);

Keep `title` and `detail` genuinely different: the title is the same sentence
for every occurrence of this problem, the detail is about this one. `instance`
is `http.Request.Path`, and the handler already receives the `HttpContext`.
