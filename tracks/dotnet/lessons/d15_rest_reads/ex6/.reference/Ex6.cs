// d15_rest_reads / ex6 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D15_RestReads;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d15/stations/search", Search);
    }

    // Binding string[] takes EVERY zone= value; binding string takes the first
    // and silently discards the rest. When the key is absent the array binds
    // empty, which is the "no filter" case.
    private static IResult Search(string[] zone)
    {
        var wanted = new HashSet<string>(zone, StringComparer.OrdinalIgnoreCase);

        return TypedResults.Ok(D15Network.Stations
            .Where(s => wanted.Count == 0 || wanted.Contains(s.Zone))
            .OrderBy(s => s.Code, StringComparer.Ordinal)
            .Select(s => new StationCard(s.Code, s.Name, s.Zone, s.Capacity, D15Network.AvailableAt(s.Code)))
            .ToList());
    }
}
