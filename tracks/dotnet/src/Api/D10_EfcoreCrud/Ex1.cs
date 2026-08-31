// d10_efcore_crud / ex1 - project, then order.
// See lessons/d10_efcore_crud/README.md, "Exercise 1".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D10_EfcoreCrud;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d10/members", List);
    }

    // 200 with every member as a MemberSummary - id, name and credits only -
    // most credits first, and ties broken by name A-Z.
    private static Task<IResult> List(D10Db db) =>
        throw new NotImplementedException(
            "ex1: GET /d10/members is not implemented yet - edit src/Api/D10_EfcoreCrud/Ex1.cs");
}
