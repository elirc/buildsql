// d15_rest_reads / ex6 - one query key, many values.
// See lessons/d15_rest_reads/README.md, "Exercise 6".

namespace DotnetDojo.Api.D15_RestReads;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d15/stations/search", Search);
    }

    // 200 with StationCards, code A-Z. ?zone= may repeat: a station matches if
    // its zone is any of the values given, compared case-insensitively. No
    // zone at all means every station.
    private static IResult Search(string? zone) =>
        // TODO ex6: binding one string keeps only the FIRST zone= value, and
        // the comparison is case-sensitive.
        TypedResults.Ok(D15Network.Stations
            .Where(s => zone is null || s.Zone == zone)
            .OrderBy(s => s.Code)
            .Select(s => new StationCard(s.Code, s.Name, s.Zone, s.Capacity, D15Network.AvailableAt(s.Code)))
            .ToList());
}
