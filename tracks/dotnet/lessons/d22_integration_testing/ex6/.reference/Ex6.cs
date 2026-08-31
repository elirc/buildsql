// d22_integration_testing / ex6 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D22_IntegrationTesting;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d22/returns/{loanId:int}", Shelve);
        app.MapGet("/d22/returns", Shelved);
    }

    // Add returns false when the id was already there, which is exactly the
    // "you have done this before" answer - so a retry is a report, not a
    // second effect and not an error.
    private static IResult Shelve(int loanId, ReturnsLog log)
    {
        if (D22Library.FindLoan(loanId) is null)
        {
            return TypedResults.NotFound();
        }

        bool first = log.Add(loanId);

        return TypedResults.Ok(new ReturnReceipt(loanId, !first, log.Snapshot().Length));
    }

    // Snapshot comes back in whatever order the set feels like. The contract
    // is ascending, so the handler sorts rather than hoping.
    private static IResult Shelved(ReturnsLog log)
    {
        var ids = log.Snapshot().OrderBy(id => id).ToList();

        return TypedResults.Ok(new ReturnsReport(ids, ids.Count));
    }
}
