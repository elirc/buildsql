## Hint 1

Two ways in - your own ward, or being the charge nurse - so this is an OR. Two
`RequireX` calls would be an AND and would demand both, which is not the rule.
One `RequireAssertion` expresses an OR directly.

## Hint 2

The assertion is handed an `AuthorizationHandlerContext`. In an
endpoint-routing application its `Resource` is the `HttpContext`, so the ward
being asked for is reachable:

    (context.Resource as HttpContext)?.Request.RouteValues["ward"] as string

Compare it with `D21Claims.WardOf(context.User)`, and short-circuit to true when
`context.User.IsInRole("charge")`.
