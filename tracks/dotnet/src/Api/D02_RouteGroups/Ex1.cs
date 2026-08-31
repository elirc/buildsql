// d02_route_groups / ex1 - one group, two endpoints.
// See lessons/d02_route_groups/README.md, "Exercise 1".

namespace DotnetDojo.Api.D02_RouteGroups;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        // TODO ex1: make a group for "/d02/recipes" and map List on the group
        // root and GetRecipe on "/{id:int}" inside it.
    }

    // 200 with every recipe title, sorted A-Z.
    private static IResult List() =>
        throw new NotImplementedException(
            "ex1: GET /d02/recipes is not implemented yet - edit src/Api/D02_RouteGroups/Ex1.cs");

    // 200 with the recipe, 404 when there is none with that id.
    private static IResult GetRecipe(int id) =>
        throw new NotImplementedException(
            "ex1: GET /d02/recipes/{id:int} is not implemented yet - edit src/Api/D02_RouteGroups/Ex1.cs");
}
