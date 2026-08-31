// d24_mixed_gauntlet / ex1 - routing plus results.
// See lessons/d24_mixed_gauntlet/README.md, "Exercise 1".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D24_MixedGauntlet;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        // TODO ex1: one catch-all route is doing two jobs and parsing its way
        // through them. "open" is a resource of its own, "abc" is not an id at
        // all, and neither decision belongs in a handler. Split this into a
        // literal route and an :int-constrained parameter route.
        app.MapGet("/d24/exhibits/{id}", Anything);
    }

    private static async Task<IResult> Anything(string id, D24Db db)
    {
        if (!int.TryParse(id, out int number))
        {
            return TypedResults.BadRequest($"'{id}' is not an exhibit id.");
        }

        var exhibit = await db.Exhibits.FirstOrDefaultAsync(e => e.Id == number);

        return exhibit is null
            ? TypedResults.NotFound()
            : TypedResults.Ok(new ExhibitDto(exhibit.Id, exhibit.Name, exhibit.Gallery, exhibit.Capacity));
    }
}
