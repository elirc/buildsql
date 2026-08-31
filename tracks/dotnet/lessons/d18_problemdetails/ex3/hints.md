## Hint 1

`TypedResults.BadRequest("...")` writes a bare string as `text/plain`. The
client now needs one code path for validation errors and another for every
other failure this API produces.

## Hint 2

`TypedResults.ValidationProblem` produces a `ProblemDetails` with one extra
member, `errors`, and takes the same optional `type:` and `instance:` as
`Problem` does:

    return TypedResults.ValidationProblem(
        new Dictionary<string, string[]> { ["seats"] = ["..."] },
        type: D18Ferry.ProblemBase + "invalid-request",
        instance: http.Request.Path);

Leave the 404 alone - it must NOT grow an `errors` dictionary, because nothing
the client sent was wrong.
