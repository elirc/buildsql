// d10_efcore_crud / ex6 - two rows, one save.
// See lessons/d10_efcore_crud/README.md, "Exercise 6".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D10_EfcoreCrud;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d10/transfer", TransferCredits);
    }

    // 200 with {"changed": …} taken from SaveChangesAsync itself.
    //
    // 404 when either member is missing; 400 when the amount is not positive
    // or the sender cannot afford it. Both rows move in ONE save, or neither
    // of them does.
    private static Task<IResult> TransferCredits(D10Db db, Transfer request) =>
        throw new NotImplementedException(
            "ex6: POST /d10/transfer is not implemented yet - edit src/Api/D10_EfcoreCrud/Ex6.cs");
}
