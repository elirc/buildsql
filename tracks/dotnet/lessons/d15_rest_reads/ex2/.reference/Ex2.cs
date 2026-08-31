// d15_rest_reads / ex2 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D15_RestReads;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d15/stations/{code}/bikes", Docked);
    }

    private static IResult Docked(string code)
    {
        // The parent has to be checked before the child is listed, or "no such
        // station" and "nothing docked" produce identical responses.
        if (D15Network.Find(code) is null)
        {
            return TypedResults.NotFound();
        }

        return TypedResults.Ok(D15Network.Bikes
            .Where(b => b.StationCode == code)
            .OrderBy(b => b.Id)
            .Select(b => new BikeCard(b.Id, b.Model, b.Status, b.StationCode))
            .ToList());
    }
}
