// d02_route_groups / ex1 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D02_RouteGroups;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/d02/recipes");

        group.MapGet("", List);
        group.MapGet("/{id:int}", GetRecipe);
    }

    private static IResult List() =>
        TypedResults.Ok(Cookbook.Recipes
            .Select(r => r.Title)
            .OrderBy(t => t, StringComparer.Ordinal)
            .ToList());

    private static IResult GetRecipe(int id)
    {
        var recipe = Cookbook.Recipes.FirstOrDefault(r => r.Id == id);

        return recipe is null ? TypedResults.NotFound() : TypedResults.Ok(recipe);
    }
}
