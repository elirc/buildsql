// d23_pagination_filtering / ex8 - the whole search contract on one endpoint.
// See lessons/d23_pagination_filtering/README.md, "Exercise 8".

namespace DotnetDojo.Api.D23_PaginationFiltering;

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d23/postings/search", Search);
    }

    // 400 as ONE validation problem naming every bad parameter at once - page,
    // size, sort, location and minSalary. Otherwise 200 with a LinkedPage:
    // the ex4 filters, an ex3 whitelist sort with the id tiebreak, total and
    // totalPages over the FILTERED rows, and next/prev links that carry every
    // supplied parameter forward in the README's order. Two SQL commands at
    // most.
    private static IResult Search(
        D23Db db,
        int? page,
        int? size,
        string? sort,
        bool? remote,
        string? location,
        int? minSalary,
        string? tag) =>
        throw new NotImplementedException(
            "ex8: GET /d23/postings/search is not implemented yet - edit src/Api/D23_PaginationFiltering/Ex8.cs");
}
