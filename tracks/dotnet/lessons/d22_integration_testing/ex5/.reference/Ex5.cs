// d22_integration_testing / ex5 - reference solution (author only, used by `dojo verify`).

using Microsoft.Extensions.Options;

namespace DotnetDojo.Api.D22_IntegrationTesting;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d22/members/{cardId}/allowance", GetAllowance);
    }

    // The limit is read from bound options every time, so the value in the
    // response is whatever THIS host was configured with - 3 by default, and
    // 2 when a test says Dojo:D22:Loans:MaxPerMember is 2.
    private static IResult GetAllowance(string cardId, IOptions<LoanPolicyOptions> policy)
    {
        var member = D22Library.FindMember(cardId);
        if (member is null)
        {
            return TypedResults.NotFound();
        }

        int max = policy.Value.MaxPerMember;
        int onLoan = D22Library.LoansFor(member.CardId).Count;

        return TypedResults.Ok(new Allowance(
            member.CardId, member.Name, onLoan, max, onLoan < max));
    }
}
