// d23_pagination_filtering / ex5 - an envelope that carries its own navigation.
// See lessons/d23_pagination_filtering/README.md, "Exercise 5".

namespace DotnetDojo.Api.D23_PaginationFiltering;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d23/postings/linked", Linked);
    }

    // 200 with a LinkedPage: the ex2 envelope plus next and prev, each either
    // null or a link of the exact form "/d23/postings/linked?page=N&size=S".
    // prev is null on page 1; next is null on the last page. A page past the
    // end is 200 with an empty items array, not 404. Defaults and 400s are
    // ex1's.
    private static IResult Linked(D23Db db, int? page, int? size) =>
        throw new NotImplementedException(
            "ex5: GET /d23/postings/linked is not implemented yet - edit src/Api/D23_PaginationFiltering/Ex5.cs");
}
