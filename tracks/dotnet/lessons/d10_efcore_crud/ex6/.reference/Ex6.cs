// d10_efcore_crud / ex6 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D10_EfcoreCrud;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d10/transfer", TransferCredits);
    }

    private static async Task<IResult> TransferCredits(D10Db db, Transfer request)
    {
        if (request.Credits < 1)
        {
            return TypedResults.BadRequest("credits must be positive.");
        }

        var sender = await db.Members.FindAsync(request.From);
        var receiver = await db.Members.FindAsync(request.To);

        if (sender is null || receiver is null)
        {
            return TypedResults.NotFound();
        }

        if (sender.Credits < request.Credits)
        {
            return TypedResults.BadRequest("the sender does not have that many credits.");
        }

        sender.Credits -= request.Credits;
        receiver.Credits += request.Credits;

        // One save, two rows: either both land or neither does.
        int changed = await db.SaveChangesAsync();

        return TypedResults.Ok(new ChangeResult(changed));
    }
}
