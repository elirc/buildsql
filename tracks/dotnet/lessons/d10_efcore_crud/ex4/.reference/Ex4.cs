// d10_efcore_crud / ex4 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D10_EfcoreCrud;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPut("/d10/members/{id:int}/credits", SetCredits);
        app.MapDelete("/d10/members/{id:int}", Delete);
    }

    private static async Task<IResult> SetCredits(D10Db db, int id, CreditChange request)
    {
        if (request.Credits < 0)
        {
            return TypedResults.BadRequest("credits cannot be negative.");
        }

        var member = await db.Members.FindAsync(id);

        if (member is null)
        {
            return TypedResults.NotFound();
        }

        // No Update call: the change tracker already noticed the assignment.
        member.Credits = request.Credits;

        await db.SaveChangesAsync();

        return TypedResults.NoContent();
    }

    private static async Task<IResult> Delete(D10Db db, int id)
    {
        var member = await db.Members.FindAsync(id);

        if (member is null)
        {
            return TypedResults.NotFound();
        }

        db.Members.Remove(member);

        await db.SaveChangesAsync();

        return TypedResults.NoContent();
    }
}
