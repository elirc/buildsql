// d15_rest_reads / ex7 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D15_RestReads;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d15/export", Export);
    }

    private static IResult Export(HttpContext http)
    {
        var accepted = http.Request.GetTypedHeaders().Accept;

        // No Accept header at all means the client has no preference.
        if (accepted.Count == 0)
        {
            return TypedResults.Ok(Cards());
        }

        // Walk the client's list in its own order of preference and answer
        // with the first thing we can actually produce.
        foreach (var media in accepted.OrderByDescending(a => a.Quality ?? 1.0))
        {
            if (media.MatchesAllTypes
                || media.MediaType.Equals("application/json", StringComparison.OrdinalIgnoreCase))
            {
                return TypedResults.Ok(Cards());
            }

            if (media.MediaType.Equals("text/csv", StringComparison.OrdinalIgnoreCase))
            {
                return TypedResults.Text(Csv(), "text/csv");
            }
        }

        // Nothing on the list is something this resource can be.
        return TypedResults.StatusCode(StatusCodes.Status406NotAcceptable);
    }

    private static string Csv() =>
        string.Join("\n", new[] { "code,name,zone,capacity,available" }
            .Concat(Cards().Select(c =>
                $"{c.Code},{c.Name},{c.Zone},{c.Capacity},{c.Available}")));

    /// <summary>Given: the station cards in contract order. Use it, do not edit it.</summary>
    public static List<StationCard> Cards() =>
        D15Network.Stations
            .OrderBy(s => s.Code, StringComparer.Ordinal)
            .Select(s => new StationCard(s.Code, s.Name, s.Zone, s.Capacity, D15Network.AvailableAt(s.Code)))
            .ToList();
}
