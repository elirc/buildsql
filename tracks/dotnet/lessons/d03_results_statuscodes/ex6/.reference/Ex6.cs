// d03_results_statuscodes / ex6 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D03_ResultsStatuscodes;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d03/bookings/{id:int}/receipt", GetReceipt);
    }

    private static IResult GetReceipt(IDeskStore store, int id, string? format)
    {
        string wanted = format ?? "json";

        if (wanted != "json" && wanted != "text")
        {
            return TypedResults.BadRequest($"'{wanted}' is not a receipt format.");
        }

        var booking = store.Find(id);

        if (booking is null)
        {
            return TypedResults.NotFound();
        }

        if (wanted == "text")
        {
            return TypedResults.Text(
                $"Booking {booking.Id}: {booking.Guest} in {booking.Room}", "text/plain");
        }

        return TypedResults.Json(new Receipt(booking.Id, booking.Guest, booking.Room));
    }
}
