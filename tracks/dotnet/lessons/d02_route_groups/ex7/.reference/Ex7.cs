// d02_route_groups / ex7 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D02_RouteGroups;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/d02/menu");

        group.AddEndpointFilter(async (context, next) =>
        {
            var result = await next(context);

            return result is List<string> items
                ? TypedResults.Ok(new Envelope(items, items.Count))
                : result;
        });

        group.MapGet("/starters", () => Titles("starter"));
        group.MapGet("/mains", () => Titles("main"));
        group.MapGet("/health", () => TypedResults.Ok("ok"));
    }

    private static List<string> Titles(string course) =>
        Cookbook.Recipes
            .Where(r => r.Course == course)
            .Select(r => r.Title)
            .OrderBy(t => t, StringComparer.Ordinal)
            .ToList();
}
