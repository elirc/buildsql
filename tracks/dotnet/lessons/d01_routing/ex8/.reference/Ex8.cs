// d01_routing / ex8 - reference solution (author only, used by `dojo verify`).

using Microsoft.AspNetCore.Mvc;

namespace DotnetDojo.Api.D01_Routing;

public record SearchResult(string Scope, string? Term, string? Zone, List<string> Matches);

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d01/search/{scope}", Search);
    }

    private static IResult Search(
        [FromRoute] string scope,
        [FromQuery(Name = "q")] string? term,
        [FromHeader(Name = "X-Zone")] string? zone)
    {
        if (scope != "stops" && scope != "lines")
        {
            return TypedResults.BadRequest($"'{scope}' is not a searchable scope.");
        }

        IEnumerable<string> candidates = scope == "lines"
            ? Network.Lines
            : Network.Stops
                .Where(s => zone is null || s.Zone == zone)
                .Select(s => s.Name);

        if (!string.IsNullOrWhiteSpace(term))
        {
            candidates = candidates.Where(
                c => c.Contains(term, StringComparison.OrdinalIgnoreCase));
        }

        var matches = candidates.OrderBy(c => c, StringComparer.Ordinal).ToList();

        return TypedResults.Ok(new SearchResult(scope, term, zone, matches));
    }
}
