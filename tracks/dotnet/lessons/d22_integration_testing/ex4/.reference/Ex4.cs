// d22_integration_testing / ex4 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D22_IntegrationTesting;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d22/reminders", Sweep);
    }

    // The handler asks for the interface and uses whatever it is given. In
    // production that is DeskLogNotifier; under a gate it is a recorder, and
    // the endpoint cannot tell the difference - which is the point.
    private static IResult Sweep(IOverdueNotifier notifier)
    {
        var overdue = D22Library.Loans
            .Where(l => l.DaysOverdue > 0)
            .OrderBy(l => l.Id)
            .ToList();

        foreach (var loan in overdue)
        {
            notifier.Notify(loan.CardId, loan.Code, loan.DaysOverdue);
        }

        return TypedResults.Ok(new SweepReport(overdue.Count));
    }
}
