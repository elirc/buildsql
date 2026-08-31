## Hint 1

`group.AddEndpointFilter(async (context, next) => { … })` wraps every endpoint in
the group. Inside, `context.HttpContext` is the request you are guarding and
`next(context)` is the rest of the pipeline, including the handler.

Two outcomes: return your own result *without* calling `next`, or set a header
and return what `next` gives you.

## Hint 2

Read the header with `context.HttpContext.Request.Headers["X-Chef"].ToString()`
— an absent header is an empty string, so `string.IsNullOrWhiteSpace` covers
both cases at once.

Refuse with `TypedResults.StatusCode(StatusCodes.Status401Unauthorized)`, and
note that returning it is the whole short-circuit: there is no `next` call on
that path.

On the accepted path, write `Response.Headers["X-Chef-Ack"]` *before* awaiting
`next`, then `return await next(context);` so the handler's own result survives.
