// d10_efcore_crud / ex8 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D10_EfcoreCrud;

public record BatchResult(List<int> Created);

public record BatchError(int Index, string Message);

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d10/members/batch", CreateMany);
    }

    private static async Task<IResult> CreateMany(D10Db db, List<NewMember> request)
    {
        if (request.Count == 0)
        {
            return TypedResults.BadRequest(new BatchError(-1, "the batch is empty."));
        }

        var taken = await db.Members.Select(m => m.Email).ToListAsync();
        var members = new List<Member>();

        for (int index = 0; index < request.Count; index++)
        {
            var item = request[index];

            if (string.IsNullOrWhiteSpace(item.Name))
            {
                return TypedResults.BadRequest(new BatchError(index, "name is required."));
            }

            if (string.IsNullOrWhiteSpace(item.Email))
            {
                return TypedResults.BadRequest(new BatchError(index, "email is required."));
            }

            if (item.Credits < 0)
            {
                return TypedResults.BadRequest(
                    new BatchError(index, "credits cannot be negative."));
            }

            if (taken.Contains(item.Email))
            {
                return TypedResults.BadRequest(
                    new BatchError(index, $"the email '{item.Email}' is already taken."));
            }

            taken.Add(item.Email);
            members.Add(new Member
            {
                Name = item.Name,
                Email = item.Email,
                Credits = item.Credits,
                Grade = "white",
            });
        }

        // Every check happened before anything was added, so a rejection cannot
        // have written half a batch.
        db.Members.AddRange(members);

        await db.SaveChangesAsync();

        var ids = members.Select(m => m.Id).ToList();

        return TypedResults.Created($"/d10/members/{ids[0]}", new BatchResult(ids));
    }
}
