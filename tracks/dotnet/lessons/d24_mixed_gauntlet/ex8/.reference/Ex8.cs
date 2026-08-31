// d24_mixed_gauntlet / ex8 - reference solution (author only, used by `dojo verify`).

using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace DotnetDojo.Api.D24_MixedGauntlet;

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        // The policy answers 401 for no token and 403 for a token without the
        // curator role, before the handler runs at all.
        app.MapPost("/d24/bookings", Book).RequireAuthorization(D24Policies.Curator);
    }

    private static async Task<IResult> Book(
        NewBooking body,
        ClaimsPrincipal user,
        D24Db db,
        IOptions<D24Options> options,
        ILogger<Ex8> logger,
        HttpContext http)
    {
        string traceId = http.TraceIdentifier;
        int max = options.Value.MaxTicketsPerVisitor;

        // Everything the client can see in its own payload, checked together.
        var errors = new Dictionary<string, string[]>();

        if (body.ExhibitId < 1)
        {
            errors["exhibitId"] = ["An exhibit id is required."];
        }

        string holder = body.Holder?.Trim() ?? "";
        if (holder.Length == 0)
        {
            errors["holder"] = ["A holder is required."];
        }

        if (body.Count < 1 || body.Count > max)
        {
            errors["count"] = [$"Between 1 and {max} tickets per visitor."];
        }

        if (errors.Count > 0)
        {
            logger.LogInformation(
                "Booking rejected for {Count} ticket(s) ({TraceId})", body.Count, traceId);

            return TypedResults.ValidationProblem(
                errors,
                type: D24Problems.Base + "invalid-request",
                instance: http.Request.Path,
                extensions: new Dictionary<string, object?> { ["traceId"] = traceId });
        }

        var exhibit = await db.Exhibits.FirstOrDefaultAsync(e => e.Id == body.ExhibitId);
        if (exhibit is null)
        {
            logger.LogInformation(
                "Booking for unknown exhibit, {Count} ticket(s) ({TraceId})", body.Count, traceId);

            return TypedResults.NotFound();
        }

        int active = await db.Tickets.CountAsync(t => t.ExhibitId == exhibit.Id && !t.Cancelled);
        int seatsLeft = exhibit.Capacity - active;

        if (seatsLeft < body.Count)
        {
            logger.LogWarning(
                "Exhibit {ExhibitId} has {SeatsLeft} seat(s) for {Count} asked ({TraceId})",
                exhibit.Id, seatsLeft, body.Count, traceId);

            return TypedResults.Problem(
                statusCode: StatusCodes.Status409Conflict,
                type: D24Problems.Base + "sold-out",
                title: "That exhibit cannot take that many.",
                detail: $"Exhibit {exhibit.Id} has {seatsLeft} seat(s) left "
                    + $"and {body.Count} were asked for.",
                instance: http.Request.Path,
                extensions: new Dictionary<string, object?>
                {
                    ["seatsLeft"] = Math.Max(seatsLeft, 0),
                    ["traceId"] = traceId,
                });
        }

        // Every ticket added, then ONE SaveChangesAsync. Saving inside the
        // loop makes a half-written booking a possible outcome, and there is
        // no request that can ever finish the other half.
        var tickets = Enumerable
            .Range(0, body.Count)
            .Select(_ => new Ticket
            {
                ExhibitId = exhibit.Id,
                Holder = holder,
                Day = 1,
                Cancelled = false,
            })
            .ToList();

        db.Tickets.AddRange(tickets);
        await db.SaveChangesAsync();

        var ids = tickets.Select(t => t.Id).OrderBy(n => n).ToList();

        logger.LogInformation(
            "Booked {Count} ticket(s) on exhibit {ExhibitId} for {Holder} ({TraceId})",
            body.Count, exhibit.Id, holder, traceId);

        return TypedResults.Created(
            $"/d24/bookings/{ids[0]}",
            new BookingDto(ids[0], exhibit.Id, holder, ids));
    }
}
