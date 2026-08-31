// d10_efcore_crud / ex8 - all of them, or none of them.
// See lessons/d10_efcore_crud/README.md, "Exercise 8".

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

    // 201 with {"created": [ids]} in request order, and a Location naming the
    // first new member.
    //
    // If ANY item is invalid - blank name, blank email, negative credits, or an
    // email the roster already has - the whole request is a 400 with
    // {"index": …, "message": …} for the FIRST bad one, and not a single row is
    // written. New members start at grade "white".
    private static Task<IResult> CreateMany(D10Db db, List<NewMember> request) =>
        throw new NotImplementedException(
            "ex8: POST /d10/members/batch is not implemented yet - edit src/Api/D10_EfcoreCrud/Ex8.cs");
}
