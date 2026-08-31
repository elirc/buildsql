// d02_route_groups / ex8 - nested groups, and filters that inherit.
// See lessons/d02_route_groups/README.md, "Exercise 8".

namespace DotnetDojo.Api.D02_RouteGroups;

public record TitleResponse(string Title);

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        // TODO ex8: two nested groups, one filter each, two endpoints.
        // The README spells out the whole contract.
    }

    // 200 with the titles this kitchen may serve, sorted A-Z.
    private static IResult Recipes(string kitchen) =>
        throw new NotImplementedException(
            "ex8: GET /d02/v1/kitchens/{kitchen}/recipes is not implemented yet - edit src/Api/D02_RouteGroups/Ex8.cs");

    // 200 with {"title": …} when this kitchen may serve that recipe, 404 when
    // the recipe does not exist or belongs to another kitchen's courses.
    private static IResult Recipe(string kitchen, int id) =>
        throw new NotImplementedException(
            "ex8: GET /d02/v1/kitchens/{kitchen}/recipes/{id:int} is not implemented yet - edit src/Api/D02_RouteGroups/Ex8.cs");
}
