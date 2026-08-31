// d23_pagination_filtering / ex2 - the page envelope.
// See lessons/d23_pagination_filtering/README.md, "Exercise 2".

namespace DotnetDojo.Api.D23_PaginationFiltering;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d23/postings/page", Page);
    }

    // 200 with a PostingPage: items (the page, id ascending), page, size,
    // total (every matching row, counted in the database) and totalPages
    // (total divided by size, rounded up). Defaults are page 1 and size 10,
    // and the same 400s as ex1. Two SQL commands at most.
    private static IResult Page(D23Db db, int? page, int? size) =>
        throw new NotImplementedException(
            "ex2: GET /d23/postings/page is not implemented yet - edit src/Api/D23_PaginationFiltering/Ex2.cs");
}
