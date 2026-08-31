// d22_integration_testing / ex2 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D22_IntegrationTesting;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d22/desk/due", Due);
    }

    // "Now" arrives as a parameter, so a test can decide what it is. The
    // handler never mentions DateTimeOffset.UtcNow.
    private static IResult Due(TimeProvider clock)
    {
        var now = clock.GetUtcNow();

        return TypedResults.Ok(new DueDate(
            D22Library.Stamp(now),
            D22Library.Stamp(now.AddDays(D22Library.DefaultLoanDays)),
            D22Library.DefaultLoanDays));
    }
}
