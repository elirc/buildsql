// d15_rest_reads / ex1 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D15_RestReads;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d15/stations", All);
        app.MapGet("/d15/stations/{code}", One);
    }

    private static IResult All() =>
        TypedResults.Ok(D15Network.Stations
            .OrderBy(s => s.Code, StringComparer.Ordinal)
            .Select(Card)
            .ToList());

    private static IResult One(string code)
    {
        // FirstOrDefault, not First: "there is no such station" is an answer
        // this endpoint owes the client, not an exception for the pipeline.
        var station = D15Network.Find(code);

        return station is null ? TypedResults.NotFound() : TypedResults.Ok(Card(station));
    }

    private static StationCard Card(Station s) =>
        new(s.Code, s.Name, s.Zone, s.Capacity, D15Network.AvailableAt(s.Code));
}
