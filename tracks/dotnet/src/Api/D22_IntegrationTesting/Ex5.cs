// d22_integration_testing / ex5 - a limit a test can change.
// See lessons/d22_integration_testing/README.md, "Exercise 5".

namespace DotnetDojo.Api.D22_IntegrationTesting;

public class Ex5 : IEndpointMapper
{
    // TODO ex5: a const is a decision baked into the binary. It happens to
    // equal the default, so this endpoint looks correct until a test boots a
    // host that says the limit is 2 - and then there is no way to make it say
    // 2 short of editing and rebuilding. Take IOptions<LoanPolicyOptions>
    // instead; it is bound to Dojo:D22:Loans in Model.cs.
    private const int MaxLoans = 3;

    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d22/members/{cardId}/allowance", GetAllowance);
    }

    // 404 when cardId names no member; otherwise 200 with
    // {"cardId", "name", "onLoan", "maxLoans", "canBorrow"}.
    private static IResult GetAllowance(string cardId)
    {
        var member = D22Library.FindMember(cardId);
        if (member is null)
        {
            return TypedResults.NotFound();
        }

        int onLoan = D22Library.LoansFor(member.CardId).Count;

        return TypedResults.Ok(new Allowance(
            member.CardId, member.Name, onLoan, MaxLoans, onLoan < MaxLoans));
    }
}
