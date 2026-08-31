// d02_route_groups / ex3 - a route parameter in the group prefix.
// See lessons/d02_route_groups/README.md, "Exercise 3".

namespace DotnetDojo.Api.D02_RouteGroups;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        // TODO ex3: a group whose prefix is "/d02/courses/{course}", with
        // Titles on the group root and Longest on "/longest".
    }

    // 200 with the titles in this course, sorted A-Z. 404 when no recipe has it.
    private static IResult Titles(string course) =>
        throw new NotImplementedException(
            "ex3: GET /d02/courses/{course} is not implemented yet - edit src/Api/D02_RouteGroups/Ex3.cs");

    // 200 with the title of the slowest recipe in this course. 404 when no
    // recipe has it.
    private static IResult Longest(string course) =>
        throw new NotImplementedException(
            "ex3: GET /d02/courses/{course}/longest is not implemented yet - edit src/Api/D02_RouteGroups/Ex3.cs");
}
