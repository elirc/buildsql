// d24_mixed_gauntlet / ex3 - options plus validation.
// See lessons/d24_mixed_gauntlet/README.md, "Exercise 3".

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace DotnetDojo.Api.D24_MixedGauntlet;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d24/reservations", Reserve);
    }

    // 400 as a validation problem collecting BOTH "holder" and "count" when
    // both are wrong, 404 for an unknown exhibit, otherwise 200 with HeldDto.
    private static async Task<IResult> Reserve(
        NewReservation body,
        D24Db db,
        IOptions<D24Options> options,
        HttpContext http)
    {
        // TODO ex3: two bugs. The limit is hard-coded, so an operator who sets
        // Dojo:D24:MaxTicketsPerVisitor changes nothing; and the first failure
        // returns, so a caller who got two things wrong is told about one.
        if (string.IsNullOrWhiteSpace(body.Holder))
        {
            return TypedResults.ValidationProblem(
                new Dictionary<string, string[]> { ["holder"] = ["A holder is required."] },
                instance: http.Request.Path);
        }

        if (body.Count < 1 || body.Count > 4)
        {
            return TypedResults.ValidationProblem(
                new Dictionary<string, string[]> { ["count"] = ["Between 1 and 4 tickets."] },
                instance: http.Request.Path);
        }

        var exhibit = await db.Exhibits.FirstOrDefaultAsync(e => e.Id == body.ExhibitId);

        return exhibit is null
            ? TypedResults.NotFound()
            : TypedResults.Ok(new HeldDto(body.Count));
    }
}
