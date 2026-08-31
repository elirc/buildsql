## Hint 1

Three branches, and two of them return without calling `next`. Get the status
codes right first: one of them means "I do not know who you are" and the other
means "I know, and no".

Only one of the two owes the client an extra header.

## Hint 2

Read `context.Request.Headers.Authorization.ToString()` — an absent header is an
empty string, so `string.IsNullOrWhiteSpace` covers it.

- absent → `StatusCodes.Status401Unauthorized` **and**
  `context.Response.Headers.WWWAuthenticate = "Bearer";`
- present but wrong → `StatusCodes.Status403Forbidden`
- correct → `return next(context);`

Both refusals `return Task.CompletedTask;` — setting a status and then calling
`next` anyway runs the handler you were trying to protect, and the status code
alone will not reveal it. The gate reads the body for exactly that reason.
