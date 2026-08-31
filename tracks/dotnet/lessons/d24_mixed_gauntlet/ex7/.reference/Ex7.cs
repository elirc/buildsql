// d24_mixed_gauntlet / ex7 - reference solution (author only, used by `dojo verify`).

using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D24_MixedGauntlet;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d24/tickets/{id:int}/cancel", Cancel).RequireAuthorization(D24Policies.Visitor);
    }

    private static async Task<IResult> Cancel(
        int id, ClaimsPrincipal user, D24Db db, ILogger<Ex7> logger, HttpContext http)
    {
        string holder = user.Identity?.Name ?? "";
        bool curator = user.IsInRole("curator");

        var ticket = await db.Tickets.FirstOrDefaultAsync(t => t.Id == id);

        // The two misses collapse into ONE answer on purpose. A 403 for
        // "somebody else's" would confirm that the id exists, and an attacker
        // can walk the id space on nothing but that difference.
        if (ticket is null || (!curator && ticket.Holder != holder))
        {
            logger.LogInformation(
                "Ticket {TicketId} not available to {Holder}", id, holder);

            return TypedResults.NotFound();
        }

        if (ticket.Cancelled)
        {
            // Warning, not Information: the request was well formed and the
            // world says no. Somebody may want to know how often that happens.
            logger.LogWarning(
                "Ticket {TicketId} was already cancelled, asked by {Holder}", id, holder);

            return TypedResults.Problem(
                statusCode: StatusCodes.Status409Conflict,
                type: D24Problems.Base + "already-cancelled",
                title: "That ticket is already cancelled.",
                detail: $"Ticket {id} was cancelled before this request.",
                instance: http.Request.Path,
                extensions: new Dictionary<string, object?> { ["ticketId"] = id });
        }

        ticket.Cancelled = true;
        await db.SaveChangesAsync();

        logger.LogInformation("Ticket {TicketId} cancelled by {Holder}", id, holder);

        return TypedResults.NoContent();
    }
}
