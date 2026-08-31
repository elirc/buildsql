## Hint 1

"May this caller edit THIS shift" needs the shift, and the shift does not exist
until the handler has loaded it - which is why an endpoint-level policy
structurally cannot answer it.

## Hint 2

Two halves. Fill in `ShiftOwnerHandler`, whose third parameter is the `Shift`
itself: succeed when `resource.Doctor` is the caller, or the caller is in the
`charge` role.

Then ask, from inside the endpoint:

    var decision = await authorization.AuthorizeAsync(user, shift, D21Policies.EditShift);
    if (!decision.Succeeded) return TypedResults.Forbid(authenticationSchemes: [D21Jwt.Scheme]);

## Hint 3

The order is graded: 404 first (there is nothing to authorize against), then the
authorization check, then the validation. Putting validation first tells a
caller with no rights at all which of their fields were malformed.

Note that `D21Policies.EditShift` is never used with `RequireAuthorization` -
the middleware would pass the `HttpContext` as the resource and the typed
handler would never match.
