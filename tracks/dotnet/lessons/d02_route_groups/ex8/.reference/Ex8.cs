// d02_route_groups / ex8 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D02_RouteGroups;

public record TitleResponse(string Title);

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var api = app.MapGroup("/d02/v1");

        api.AddEndpointFilter(async (context, next) =>
        {
            if (context.HttpContext.Request.Headers["X-Api-Version"] != "1")
            {
                return TypedResults.BadRequest("X-Api-Version must be 1.");
            }

            return await next(context);
        });

        var kitchens = api.MapGroup("/kitchens/{kitchen}");

        kitchens.AddEndpointFilter(async (context, next) =>
        {
            var http = context.HttpContext;
            http.Response.Headers["X-Kitchen-Checked"] = "yes";

            string kitchen = http.Request.RouteValues["kitchen"]?.ToString() ?? "";

            if (!Cookbook.Kitchens.ContainsKey(kitchen))
            {
                return TypedResults.NotFound();
            }

            return await next(context);
        });

        kitchens.MapGet("/recipes", Recipes);
        kitchens.MapGet("/recipes/{id:int}", Recipe);
    }

    private static IResult Recipes(string kitchen)
    {
        string[] courses = Cookbook.Kitchens[kitchen];

        return TypedResults.Ok(Cookbook.Recipes
            .Where(r => courses.Contains(r.Course))
            .Select(r => r.Title)
            .OrderBy(t => t, StringComparer.Ordinal)
            .ToList());
    }

    private static IResult Recipe(string kitchen, int id)
    {
        string[] courses = Cookbook.Kitchens[kitchen];

        var recipe = Cookbook.Recipes
            .FirstOrDefault(r => r.Id == id && courses.Contains(r.Course));

        return recipe is null
            ? TypedResults.NotFound()
            : TypedResults.Ok(new TitleResponse(recipe.Title));
    }
}
