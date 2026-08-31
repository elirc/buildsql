// d03_results_statuscodes / ex3 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D03_ResultsStatuscodes;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapDelete("/d03/bookings/{id:int}", Cancel);
    }

    private static IResult Cancel(IDeskStore store, int id) =>
        store.Remove(id) ? TypedResults.NoContent() : TypedResults.NotFound();
}
