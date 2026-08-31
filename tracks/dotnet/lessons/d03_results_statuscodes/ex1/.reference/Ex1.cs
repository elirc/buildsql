// d03_results_statuscodes / ex1 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D03_ResultsStatuscodes;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d03/bookings", List);
        app.MapGet("/d03/bookings/{id:int}", GetBooking);
    }

    private static IResult List(IDeskStore store, string? state)
    {
        var bookings = store.Bookings().AsEnumerable();

        if (!string.IsNullOrWhiteSpace(state))
        {
            bookings = bookings.Where(b => b.State == state);
        }

        return TypedResults.Ok(bookings.OrderBy(b => b.Id).ToList());
    }

    private static IResult GetBooking(IDeskStore store, int id)
    {
        var booking = store.Find(id);

        return booking is null ? TypedResults.NotFound() : TypedResults.Ok(booking);
    }
}
