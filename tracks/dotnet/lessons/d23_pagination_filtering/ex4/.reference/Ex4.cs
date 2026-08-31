// d23_pagination_filtering / ex4 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D23_PaginationFiltering;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d23/postings/filter", Filter);
    }

    private static async Task<IResult> Filter(
        D23Db db, bool? remote, string? location, int? minSalary, string? tag)
    {
        // Compose onto ONE IQueryable. Nothing executes until ToListAsync, so
        // four optional Wheres are four AND clauses in a single SELECT - not
        // four passes over a list.
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
            // "sql" must not match "nosql". Wrapping both the column and the
            // needle in the delimiter turns a substring test into a whole
            // element test, and it still translates to instr().
            string needle = "," + tag + ",";
            q = q.Where(x => ("," + x.Tags + ",").Contains(needle));
        }

        var items = await q
            .OrderBy(x => x.Id)
            .Select(D23Cards.Card)
            .ToListAsync();

        // No matches is a legal answer, so this is a 200 with an empty array.
        return TypedResults.Ok(items);
    }
}
