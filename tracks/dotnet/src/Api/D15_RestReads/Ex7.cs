// d15_rest_reads / ex7 - two representations of one resource.
// See lessons/d15_rest_reads/README.md, "Exercise 7".

namespace DotnetDojo.Api.D15_RestReads;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d15/export", Export);
    }

    // Serves the station list in whichever representation the client asked
    // for: JSON (application/json, */*, or no Accept at all) or text/csv.
    // Anything else is 406 with no body.
    private static IResult Export(HttpContext http)
    {
        // TODO ex7: the Accept header is never read, so a client asking for
        // CSV gets JSON and a client asking for XML gets JSON too.
        return TypedResults.Ok(Cards());
    }

    /// <summary>Given: the station cards in contract order. Use it, do not edit it.</summary>
    public static List<StationCard> Cards() =>
        D15Network.Stations
            .OrderBy(s => s.Code, StringComparer.Ordinal)
            .Select(s => new StationCard(s.Code, s.Name, s.Zone, s.Capacity, D15Network.AvailableAt(s.Code)))
            .ToList();
}
