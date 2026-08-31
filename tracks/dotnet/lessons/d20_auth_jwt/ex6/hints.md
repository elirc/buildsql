## Hint 1

The endpoint has no `RequireAuthorization`, so nothing has authenticated the
request and the ambient `ClaimsPrincipal` is empty even when a perfectly good
token was sent. You have to ask the scheme yourself.

## Hint 2

`var result = await http.AuthenticateAsync(D20Jwt.Scheme);` gives you an
`AuthenticateResult`. Check `result.Succeeded` before touching
`result.Principal` - a forged or expired token produces a failed result, and it
must unlock nothing.

From there the ownership test is ex4's, against `result.Principal`. Never a 401:
this resource is public, and the token only decides how much of it comes back.
