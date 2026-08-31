// d22_integration_testing / ex7 - three seams on one endpoint.
// See lessons/d22_integration_testing/README.md, "Exercise 7".

using Microsoft.Extensions.Options;

namespace DotnetDojo.Api.D22_IntegrationTesting;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d22/renewals/{loanId:int}", Renew);
    }

    // 404 when loanId names no seeded loan.
    // 409 with a RenewalRefused body when the loan is overdue by MORE than
    //     GraceDays - and only then, and only after telling the notifier.
    // 200 with a Renewal otherwise: renewedAt is now, dueAt is LoanDays later,
    //     both stamped with D22Library.Stamp.
    private static IResult Renew(
        int loanId,
        TimeProvider clock,
        IOptions<LoanPolicyOptions> policy,
        IOverdueNotifier notifier) =>
        throw new NotImplementedException(
            "ex7: POST /d22/renewals/{loanId} is not implemented yet - edit src/Api/D22_IntegrationTesting/Ex7.cs");
}
