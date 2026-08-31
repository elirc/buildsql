// d10_efcore_crud / ex7 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D10_EfcoreCrud;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPut("/d10/roster/{email}", Upsert);
    }

    private static async Task<IResult> Upsert(D10Db db, string email, UpsertMember request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || request.Credits < 0)
        {
            return TypedResults.BadRequest("name is required and credits cannot be negative.");
        }

        var existing = await db.Members.FirstOrDefaultAsync(m => m.Email == email);

        if (existing is not null)
        {
            existing.Name = request.Name;
            existing.Credits = request.Credits;

            await db.SaveChangesAsync();

            return TypedResults.NoContent();
        }

        var member = new Member
        {
            Name = request.Name,
            Email = email,
            Credits = request.Credits,
            Grade = "white",
        };

        db.Members.Add(member);

        await db.SaveChangesAsync();

        return TypedResults.Created($"/d10/members/{member.Id}", member);
    }
}
