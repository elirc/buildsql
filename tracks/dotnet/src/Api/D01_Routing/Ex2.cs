// d01_routing / ex2 - two route parameters, one of them constrained.
// See lessons/d01_routing/README.md, "Exercise 2".

namespace DotnetDojo.Api.D01_Routing;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        // The range constraint is part of the exercise - leave it in place.
        app.MapGet("/d01/departures/{line}/{hour:int:range(0,23)}", GetDepartures);
    }

    // 200 with the destinations leaving on this line at this hour, sorted A-Z.
    // A line the network does not run is a 404; a line that runs but has
    // nothing at that hour is a 200 with an empty array.
    private static IResult GetDepartures(string line, int hour) =>
        throw new NotImplementedException(
            "ex2: GET /d01/departures/{line}/{hour} is not implemented yet - edit src/Api/D01_Routing/Ex2.cs");
}
