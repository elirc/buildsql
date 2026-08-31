// d10_efcore_crud / ex3 - create, and the id the database gives you.
// See lessons/d10_efcore_crud/README.md, "Exercise 3".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D10_EfcoreCrud;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d10/members", Create);
    }

    // 201 with a Location of /d10/members/{id} and the created member.
    // A blank name, a blank email or negative credits is a 400 that writes
    // nothing. New members start at grade "white".
    private static Task<IResult> Create(D10Db db, NewMember request) =>
        throw new NotImplementedException(
            "ex3: POST /d10/members is not implemented yet - edit src/Api/D10_EfcoreCrud/Ex3.cs");
}
