// d10_efcore_crud / ex2 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D10_EfcoreCrud;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d10/members/{id:int}", GetMember);
        app.MapGet("/d10/members/by-email/{email}", GetByEmail);
    }

    private static async Task<IResult> GetMember(D10Db db, int id)
    {
        // FindAsync is the primary-key lookup, and it answers from the change
        // tracker without a round trip when the row is already loaded.
        var member = await db.Members.FindAsync(id);

        return member is null ? TypedResults.NotFound() : TypedResults.Ok(member);
    }

    private static async Task<IResult> GetByEmail(D10Db db, string email)
    {
        var member = await db.Members.FirstOrDefaultAsync(m => m.Email == email);

        return member is null ? TypedResults.NotFound() : TypedResults.Ok(member);
    }
}
