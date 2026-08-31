// d02_route_groups / ex2 - groups inside groups.
// See lessons/d02_route_groups/README.md, "Exercise 2".

namespace DotnetDojo.Api.D02_RouteGroups;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        // TODO ex2: an "/d02/admin" group, and two groups inside it -
        // "/recipes" carrying Count on "/count", and "/courses" carrying
        // Courses on its own root.
    }

    // 200 with {"count": …} - how many recipes the cookbook holds.
    private static IResult Count() =>
        throw new NotImplementedException(
            "ex2: GET /d02/admin/recipes/count is not implemented yet - edit src/Api/D02_RouteGroups/Ex2.cs");

    // 200 with every course, distinct and sorted A-Z.
    private static IResult Courses() =>
        throw new NotImplementedException(
            "ex2: GET /d02/admin/courses is not implemented yet - edit src/Api/D02_RouteGroups/Ex2.cs");
}
