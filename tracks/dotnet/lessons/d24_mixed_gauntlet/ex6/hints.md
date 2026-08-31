## Hint 1

Two bugs, and they are independent. One is that the query does not mention the
caller at all, so everybody reads everybody's tickets. The other is that
`$"..."` is evaluated before `LogInformation` is called, so the logger receives
one finished string and no fields.

## Hint 2

The scheme sets `NameClaimType` to `sub`, so `user.Identity?.Name` is the token
subject, and `user.IsInRole("curator")` is the widening. Compute both into
locals and put them in the `Where` - not in a filter after `ToListAsync`.

Then log with a template: the placeholders in
`"Listed {Count} tickets for {Holder}"` become named properties, and the values
go in as arguments after the template.
