// d24_mixed_gauntlet / ex6 - authorization plus structured logging.
// See lessons/d24_mixed_gauntlet/README.md, "Exercise 6".

using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D24_MixedGauntlet;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d24/tickets", Mine).RequireAuthorization(D24Policies.Visitor);
    }

    // 200 with the caller's own tickets as TicketDtos, id ascending - or every
    // ticket when the caller is in the "curator" role. Exactly one
    // Information entry, carrying Holder and Count as named properties.
    private static async Task<IResult> Mine(ClaimsPrincipal user, D24Db db, ILogger<Ex6> logger)
    {
        string holder = user.Identity?.Name ?? "";

        // TODO ex6: two bugs. The token said who is asking and the query
        // ignores it, so everybody reads everybody's tickets; and the log line
        // is an interpolated string, which is rendered before the logger ever
        // sees it and so carries no named properties at all.
        var tickets = await db.Tickets
            .OrderBy(t => t.Id)
            .Select(t => new TicketDto(t.Id, t.ExhibitId, t.Holder, t.Day, t.Cancelled))
            .ToListAsync();

        logger.LogInformation($"Listed {tickets.Count} tickets for {holder}");

        return TypedResults.Ok(tickets);
    }
}
