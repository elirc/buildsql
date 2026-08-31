// d15_rest_reads / ex4 - a literal segment and a parameter segment.
// See lessons/d15_rest_reads/README.md, "Exercise 4".

namespace DotnetDojo.Api.D15_RestReads;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        // TODO ex4: one route is doing two jobs. Split it into a literal route
        // for /available and a parameter route constrained to integers, and
        // let routing - not an if - decide which one a URL means.
        app.MapGet("/d15/bikes/{id}", Anything);
    }

    private static IResult Anything(string id)
    {
        if (int.TryParse(id, out int number))
        {
            var bike = D15Network.Bikes.FirstOrDefault(b => b.Id == number);
            return bike is null
                ? TypedResults.NotFound()
                : TypedResults.Ok(new BikeCard(bike.Id, bike.Model, bike.Status, bike.StationCode));
        }

        return TypedResults.BadRequest($"'{id}' is not a bike id.");
    }
}
