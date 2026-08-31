// d24_mixed_gauntlet / ex5 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D24_MixedGauntlet;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d24/exhibits/{id:int}/tickets", Issue);
    }

    private static async Task<IResult> Issue(int id, NewTicket body, D24Db db, HttpContext http)
    {
        var exhibit = await db.Exhibits.FirstOrDefaultAsync(e => e.Id == id);
        if (exhibit is null)
        {
            return TypedResults.Problem(
                statusCode: StatusCodes.Status404NotFound,
                type: D24Problems.Base + "exhibit-not-found",
                title: "No such exhibit.",
                detail: $"This museum has no exhibit {id}.",
                instance: http.Request.Path);
        }

        // A cancelled ticket is a row that no longer holds a seat, so the
        // count that matters is the ACTIVE one.
        int active = await db.Tickets.CountAsync(t => t.ExhibitId == id && !t.Cancelled);
        int seatsLeft = exhibit.Capacity - active;

        if (seatsLeft <= 0)
        {
            // 409, not 400: nothing the client sent is malformed. The type is
            // the stable identity a client branches on, and seatsLeft is the
            // number it needs so it does not have to ask again to find out.
            return TypedResults.Problem(
                statusCode: StatusCodes.Status409Conflict,
                type: D24Problems.Base + "sold-out",
                title: "That exhibit is full.",
                detail: $"Exhibit {id} has no seats left.",
                instance: http.Request.Path,
                extensions: new Dictionary<string, object?> { ["seatsLeft"] = Math.Max(seatsLeft, 0) });
        }

        var ticket = new Ticket
        {
            ExhibitId = id,
            Holder = body.Holder ?? "",
            Day = body.Day,
            Cancelled = false,
        };

        db.Tickets.Add(ticket);
        await db.SaveChangesAsync();

        // 201 says something was created; Location says where it now lives.
        return TypedResults.Created(
            $"/d24/tickets/{ticket.Id}",
            new TicketDto(ticket.Id, ticket.ExhibitId, ticket.Holder, ticket.Day, ticket.Cancelled));
    }
}
