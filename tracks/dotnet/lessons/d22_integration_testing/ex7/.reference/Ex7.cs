// d22_integration_testing / ex7 - reference solution (author only, used by `dojo verify`).

using Microsoft.Extensions.Options;

namespace DotnetDojo.Api.D22_IntegrationTesting;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d22/renewals/{loanId:int}", Renew);
    }

    // Three things this handler could have taken for itself - the time, the
    // limit, the outbound call - and all three arrive as parameters. That is
    // the only reason a gate can pin any of the three down.
    private static IResult Renew(
        int loanId,
        TimeProvider clock,
        IOptions<LoanPolicyOptions> policy,
        IOverdueNotifier notifier)
    {
        var loan = D22Library.FindLoan(loanId);
        if (loan is null)
        {
            return TypedResults.NotFound();
        }

        var limits = policy.Value;

        if (loan.DaysOverdue > limits.GraceDays)
        {
            notifier.Notify(loan.CardId, loan.Code, loan.DaysOverdue);

            return TypedResults.Json(
                new RenewalRefused(loan.Id, loan.DaysOverdue, limits.GraceDays),
                statusCode: 409);
        }

        var now = clock.GetUtcNow();

        return TypedResults.Ok(new Renewal(
            loan.Id,
            loan.CardId,
            loan.Code,
            D22Library.Stamp(now),
            D22Library.Stamp(now.AddDays(limits.LoanDays))));
    }
}
