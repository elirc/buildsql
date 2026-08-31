## Hint 1

`Accept` is a *list* of what the client can read, in preference order - not a
single string to compare for equality. `http.Request.GetTypedHeaders().Accept`
parses it into `MediaTypeHeaderValue`s for you.

## Hint 2

Walk that list and return the first thing you can produce: `MatchesAllTypes`
(that is `*/*`) or `application/json` means JSON, `text/csv` means CSV. An
empty list - no `Accept` header at all - means no preference, so JSON. Fall off
the end of the loop and you have found nothing you can serve.

## Hint 3

CSV goes out with `TypedResults.Text(csv, "text/csv")`, which sets the
`Content-Type`. Build the body as the header row plus one row per card from
`Cards()`, joined with `"\n"` and no trailing newline. The refusal is
`TypedResults.StatusCode(StatusCodes.Status406NotAcceptable)`.
