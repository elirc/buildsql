// d02_route_groups / ex2 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D02_RouteGroups;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var admin = app.MapGroup("/d02/admin");

        var recipes = admin.MapGroup("/recipes");
        recipes.MapGet("/count", Count);

        var courses = admin.MapGroup("/courses");
        courses.MapGet("", Courses);
    }

    private static IResult Count() =>
        TypedResults.Ok(new { count = Cookbook.Recipes.Count });

    private static IResult Courses() =>
        TypedResults.Ok(Cookbook.Recipes
            .Select(r => r.Course)
            .Distinct()
            .OrderBy(c => c, StringComparer.Ordinal)
            .ToList());
}
