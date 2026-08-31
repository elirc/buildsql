// d15_rest_reads / ex2 - empty is not the same as missing.
// See lessons/d15_rest_reads/README.md, "Exercise 2".

namespace DotnetDojo.Api.D15_RestReads;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d15/stations/{code}/bikes", Docked);
    }

    // 200 with the bikes docked at that station as BikeCards, id ascending -
    // including the ones in service. A station with nothing docked is 200 and
    // an empty array. A code that names no station at all is 404.
    private static IResult Docked(string code) =>
        // TODO ex2: this cannot tell "no such station" from "nothing docked
        // here" - both come back as an empty 200.
        TypedResults.Ok(D15Network.Bikes
            .Where(b => b.StationCode == code)
            .Select(b => new BikeCard(b.Id, b.Model, b.Status, b.StationCode))
            .ToList());
}
