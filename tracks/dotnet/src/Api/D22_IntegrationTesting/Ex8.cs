// d22_integration_testing / ex8 - the whole desk, every seam injected.
// See lessons/d22_integration_testing/README.md, "Exercise 8".

using Microsoft.Extensions.Options;

namespace DotnetDojo.Api.D22_IntegrationTesting;

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d22/loans", Issue);
        app.MapGet("/d22/loans/{id:int}", One);
    }

    // 400 (validation problem, keys "cardId" and "code") for blanks, then 404
    // for an unknown member or book, then 409 with a LoanRefused body when the
    // member is already at MaxPerMember, then 201 with Location
    // /d22/loans/{id} and an IssuedLoan.
    private static IResult Issue(
        NewLoan request,
        LoanBook loans,
        TimeProvider clock,
        IOptions<LoanPolicyOptions> policy,
        IOverdueNotifier notifier) =>
        throw new NotImplementedException(
            "ex8: POST /d22/loans is not implemented yet - edit src/Api/D22_IntegrationTesting/Ex8.cs");

    // 200 with the loan this host issued under that id, 404 when it issued none.
    private static IResult One(int id, LoanBook loans) =>
        throw new NotImplementedException(
            "ex8: GET /d22/loans/{id} is not implemented yet - edit src/Api/D22_IntegrationTesting/Ex8.cs");
}
