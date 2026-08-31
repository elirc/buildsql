// d24_mixed_gauntlet / ex3 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace DotnetDojo.Api.D24_MixedGauntlet;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d24/reservations", Reserve);
    }

    private static async Task<IResult> Reserve(
        NewReservation body,
        D24Db db,
        IOptions<D24Options> options,
        HttpContext http)
    {
        // Read the limit from the options object, once, here. A constant in
        // the handler is a setting nobody can change without a deploy.
        int max = options.Value.MaxTicketsPerVisitor;

        // Collect every failure, then report. Returning on the first one makes
        // the caller fix, resend, and discover the next.
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(body.Holder))
        {
            errors["holder"] = ["A holder is required."];
        }

        if (body.Count < 1 || body.Count > max)
        {
            errors["count"] = [$"Between 1 and {max} tickets per visitor."];
        }

        if (errors.Count > 0)
        {
            return TypedResults.ValidationProblem(
                errors,
                type: D24Problems.Base + "invalid-request",
                instance: http.Request.Path);
        }

        // The payload is well formed, so anything wrong from here on is about
        // the world rather than the request: an unknown exhibit is a 404.
        bool exists = await db.Exhibits.AnyAsync(e => e.Id == body.ExhibitId);

        return exists ? TypedResults.Ok(new HeldDto(body.Count)) : TypedResults.NotFound();
    }
}
