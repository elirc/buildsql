// d01_routing / ex4 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D01_Routing;

public record Timetable(string Line, string Day, List<int> Hours);

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d01/lines/{line}/timetable/{day?}", GetTimetable);
    }

    private static IResult GetTimetable(string line, string? day)
    {
        string when = day ?? "weekday";

        if (when != "weekday" && when != "weekend")
        {
            return TypedResults.BadRequest($"'{when}' is not a timetable day.");
        }

        if (!Network.Lines.Contains(line))
        {
            return TypedResults.NotFound();
        }

        var hours = Network.Departures
            .Where(d => d.Line == line)
            .Where(d => when == "weekday" || d.Hour >= 9)
            .Select(d => d.Hour)
            .Distinct()
            .OrderBy(h => h)
            .ToList();

        return TypedResults.Ok(new Timetable(line, when, hours));
    }
}
