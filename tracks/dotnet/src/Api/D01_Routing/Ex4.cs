// d01_routing / ex4 - an optional segment and the default behind it.
// See lessons/d01_routing/README.md, "Exercise 4".

namespace DotnetDojo.Api.D01_Routing;

public record Timetable(string Line, string Day, List<int> Hours);

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d01/lines/{line}/timetable/{day?}", GetTimetable);
    }

    // 200 with {"line": …, "day": …, "hours": [ … ]}. day defaults to
    // "weekday"; "weekend" drops every hour before 09:00; anything else is a
    // 400. A line the network does not run is a 404.
    private static IResult GetTimetable(string line, string? day) =>
        throw new NotImplementedException(
            "ex4: GET /d01/lines/{line}/timetable/{day?} is not implemented yet - edit src/Api/D01_Routing/Ex4.cs");
}
