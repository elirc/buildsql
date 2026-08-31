// d01_routing / ex8 - every parameter says where it comes from.
// See lessons/d01_routing/README.md, "Exercise 8".

using Microsoft.AspNetCore.Mvc;

namespace DotnetDojo.Api.D01_Routing;

public record SearchResult(string Scope, string? Term, string? Zone, List<string> Matches);

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d01/search/{scope}", Search);
    }

    // 200 with {"scope": …, "term": …, "zone": …, "matches": [ … ]}.
    //
    // TODO ex8: three of these parameters need an explicit binding source
    // attribute. The query parameter is spelled "q", not "term", and the
    // header is "X-Zone".
    //
    // scope is "stops" or "lines"; anything else is a 400. term keeps the
    // names that contain it, case-insensitively; no term keeps everything.
    // zone narrows stops to that zone and is ignored for lines. Matches are
    // sorted A-Z.
    private static IResult Search(string scope, string? term, string? zone) =>
        throw new NotImplementedException(
            "ex8: GET /d01/search/{scope} is not implemented yet - edit src/Api/D01_Routing/Ex8.cs");
}
