// d24_mixed_gauntlet / ex6 - reference solution (author only, used by `dojo verify`).

using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D24_MixedGauntlet;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d24/tickets", Mine).RequireAuthorization(D24Policies.Visitor);
    }

    private static async Task<IResult> Mine(ClaimsPrincipal user, D24Db db, ILogger<Ex6> logger)
    {
        // NameClaimType is "sub" on this scheme, so Identity.Name IS the
        // token's subject. It is the only trustworthy answer to "who is this".
        string holder = user.Identity?.Name ?? "";
        bool curator = user.IsInRole("curator");

        // The filter goes in the QUERY. A filter applied after loading every
        // row is one refactor away from being forgotten, and until then it is
        // still shipping everybody's data across the wire.
        var tickets = await db.Tickets
            .Where(t => curator || t.Holder == holder)
            .OrderBy(t => t.Id)
            .Select(t => new TicketDto(t.Id, t.ExhibitId, t.Holder, t.Day, t.Cancelled))
            .ToListAsync();

        // One entry, with a TEMPLATE: the placeholders become named properties
        // that a log store can index, and the rendered sentence still reads.
        logger.LogInformation(
            "Listed {Count} tickets for {Holder}", tickets.Count, holder);

        return TypedResults.Ok(tickets);
    }
}
