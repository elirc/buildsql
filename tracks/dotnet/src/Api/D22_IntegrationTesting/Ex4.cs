// d22_integration_testing / ex4 - a seam for the outbound call.
// See lessons/d22_integration_testing/README.md, "Exercise 4".

namespace DotnetDojo.Api.D22_IntegrationTesting;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d22/reminders", Sweep);
    }

    // 200 with {"notified": 3}: one Notify call per overdue seeded loan, id
    // ascending, carrying that loan's cardId, code and daysOverdue.
    private static IResult Sweep()
    {
        // TODO ex4: `new DeskLogNotifier()` hard-wires the concrete class into
        // the handler. The count below is right and the endpoint still does
        // nothing a test can see, because the fake a test registers is never
        // the object being called. Take an IOverdueNotifier parameter - it is
        // registered in Model.cs - and call that one.
        var notifier = new DeskLogNotifier();

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
