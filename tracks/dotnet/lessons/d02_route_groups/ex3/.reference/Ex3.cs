// d02_route_groups / ex3 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D02_RouteGroups;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/d02/courses/{course}");

        group.MapGet("", Titles);
        group.MapGet("/longest", Longest);
    }

    private static IResult Titles(string course)
    {
        var titles = InCourse(course)
            .Select(r => r.Title)
            .OrderBy(t => t, StringComparer.Ordinal)
            .ToList();

        return titles.Count == 0 ? TypedResults.NotFound() : TypedResults.Ok(titles);
    }

    private static IResult Longest(string course)
    {
        var slowest = InCourse(course)
            .OrderByDescending(r => r.Minutes)
            .FirstOrDefault();

        return slowest is null ? TypedResults.NotFound() : TypedResults.Ok(slowest.Title);
    }

    private static IEnumerable<Recipe> InCourse(string course) =>
        Cookbook.Recipes.Where(r => r.Course == course);
}
