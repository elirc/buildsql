// d22_integration_testing / ex2 - the clock is a dependency.
// See lessons/d22_integration_testing/README.md, "Exercise 2".

namespace DotnetDojo.Api.D22_IntegrationTesting;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d22/desk/due", Due);
    }

    // 200 with {"issuedAt": ..., "dueAt": ..., "loanDays": 14} where issuedAt
    // is now and dueAt is D22Library.DefaultLoanDays later, both stamped with
    // D22Library.Stamp.
    private static IResult Due()
    {
        // TODO ex2: DateTimeOffset.UtcNow is not a value the handler was
        // given, it is a value the handler went and took. No test can ever say
        // what "now" is, so no test can ever assert a due date. Take a
        // TimeProvider parameter - it is registered in Model.cs - and call
        // GetUtcNow() on it.
        var now = DateTimeOffset.UtcNow;

        return TypedResults.Ok(new DueDate(
            D22Library.Stamp(now),
            D22Library.Stamp(now.AddDays(D22Library.DefaultLoanDays)),
            D22Library.DefaultLoanDays));
    }
}
