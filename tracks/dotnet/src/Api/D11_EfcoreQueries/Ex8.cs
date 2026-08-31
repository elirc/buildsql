// d11_efcore_queries / ex8 - build the query, then run it once.
// See lessons/d11_efcore_queries/README.md, "Exercise 8".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D11_EfcoreQueries;

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d11/search", Search);
    }

    // 200 with {"items": [{"student": …, "course": …, "score": …}],
    // "total": …} where total is how many MATCHED, not how many were returned.
    //
    //   subject   optional, matches the course's subject
    //   minScore  optional, keeps scores greater than or equal to it
    //   sort      "score" (highest first, the default), "student" or "course"
    //             (A-Z); anything else is a 400
    //   page      1-based, default 1
    //   size      default 3, maximum 20
    //
    // Ties are broken by enrolment id so the paging is stable. Filtering,
    // sorting and paging all happen on the database: TWO SQL commands, whatever
    // the parameters.
    private static Task<IResult> Search(
        D11Db db, string? subject, int? minScore, string? sort, int? page, int? size) =>
        throw new NotImplementedException(
            "ex8: GET /d11/search is not implemented yet - edit src/Api/D11_EfcoreQueries/Ex8.cs");
}
