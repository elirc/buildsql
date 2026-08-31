// d23_pagination_filtering / ex4 - optional filters, all ANDed, one query.
// See lessons/d23_pagination_filtering/README.md, "Exercise 4".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D23_PaginationFiltering;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d23/postings/filter", Filter);
    }

    // 200 with every posting that matches all of the filters given, id
    // ascending. ?remote=, ?location=, ?minSalary= and ?tag= are each optional
    // and are ANDed together; an absent one narrows nothing. No matches is 200
    // with an empty array. One SQL command.
    private static async Task<IResult> Filter(
        D23Db db, bool? remote, string? location, int? minSalary, string? tag)
    {
        IQueryable<Posting> q = db.Postings;

        if (remote is bool wantRemote)
        {
            q = q.Where(x => x.Remote == wantRemote);
        }

        if (location is not null)
        {
            q = q.Where(x => x.Location == location);
        }

        if (minSalary is int floor)
        {
            q = q.Where(x => x.SalaryMax >= floor);
        }

        if (tag is not null)
        {
            // TODO ex4: a tag is a whole element of a comma separated list,
            // and this asks whether the list CONTAINS those letters anywhere.
            // "nosql" contains "sql", so ?tag=sql drags two nosql postings in
            // with it. Match the delimiters around the tag, not the tag alone.
            q = q.Where(x => x.Tags.Contains(tag));
        }

        var items = await q
            .OrderBy(x => x.Id)
            .Select(D23Cards.Card)
            .ToListAsync();

        return TypedResults.Ok(items);
    }
}
