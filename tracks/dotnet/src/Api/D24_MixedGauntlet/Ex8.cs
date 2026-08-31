// d24_mixed_gauntlet / ex8 - everything this track teaches, on one write.
// See lessons/d24_mixed_gauntlet/README.md, "Exercise 8".

using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace DotnetDojo.Api.D24_MixedGauntlet;

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d24/bookings", Book).RequireAuthorization(D24Policies.Curator);
    }

    // 400 collecting "exhibitId", "holder" and "count" at once; 404 for an
    // unknown exhibit; 409 problem details with "seatsLeft" when capacity is
    // short; otherwise 201, Location /d24/bookings/{firstTicketId}, a
    // BookingDto listing the new ticket ids ascending, all in ONE
    // SaveChangesAsync - and exactly one log entry carrying TraceId and Count.
    private static Task<IResult> Book(
        NewBooking body,
        ClaimsPrincipal user,
        D24Db db,
        IOptions<D24Options> options,
        ILogger<Ex8> logger,
        HttpContext http) =>
        throw new NotImplementedException(
            "ex8: POST /d24/bookings is not implemented yet - edit src/Api/D24_MixedGauntlet/Ex8.cs");
}
