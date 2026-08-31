## Hint 1

The policy is already correct. What is missing is one line, and where it goes is
the exercise: on the group rather than on each endpoint.

## Hint 2

    var ops = app.MapGroup("/d21/ops").RequireAuthorization(D21Policies.Ops);

Metadata on a group is inherited by everything mapped under it, so the ninth
endpoint somebody adds next year is protected the moment it is written - which
is a property that per-endpoint calls cannot give you no matter how careful
everyone is.
