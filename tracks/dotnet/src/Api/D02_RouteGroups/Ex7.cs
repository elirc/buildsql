// d02_route_groups / ex7 - a filter that rewrites the result.
// See lessons/d02_route_groups/README.md, "Exercise 7".

namespace DotnetDojo.Api.D02_RouteGroups;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/d02/menu");

        // TODO ex7: add ONE endpoint filter to the group that wraps a
        // List<string> result in an Envelope and leaves anything else alone.

        group.MapGet("/starters", () => Titles("starter"));
        group.MapGet("/mains", () => Titles("main"));
        group.MapGet("/health", () => TypedResults.Ok("ok"));
    }

    // Given: these handlers return a bare list, on purpose.
    private static List<string> Titles(string course) =>
        Cookbook.Recipes
            .Where(r => r.Course == course)
            .Select(r => r.Title)
            .OrderBy(t => t, StringComparer.Ordinal)
            .ToList();
}
