// d11_efcore_queries / ex7 - one query, or one query per collection.
// See lessons/d11_efcore_queries/README.md, "Exercise 7".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D11_EfcoreQueries;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d11/students/{id:int}/detail", GetDetail);
    }

    // 200 with {"name": …, "courses": [titles sorted A-Z]} for one student,
    // 404 when there is no such student.
    //
    // The SAME query, loaded two ways: split=false (the default) must cost one
    // SQL command, split=true must cost two. Use Include and ThenInclude - not
    // a projection - so the difference is visible.
    private static Task<IResult> GetDetail(D11Db db, int id, bool? split) =>
        throw new NotImplementedException(
            "ex7: GET /d11/students/{id:int}/detail is not implemented yet - edit src/Api/D11_EfcoreQueries/Ex7.cs");
}
