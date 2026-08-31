// d23_pagination_filtering / ex8 - reference solution (author only, used by `dojo verify`).

using System.Text;
using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D23_PaginationFiltering;

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d23/postings/search", Search);
    }

    private static async Task<IResult> Search(
        D23Db db,
        int? page,
        int? size,
        string? sort,
        bool? remote,
        string? location,
        int? minSalary,
        string? tag)
    {
        int p = page ?? 1;
        int s = size ?? 10;
        string key = sort ?? "postedDay";

        // Collect, do not return early. One request should learn everything
        // that is wrong with it, not the first thing.
        var errors = new Dictionary<string, string[]>();

        if (p < 1)
        {
            errors["page"] = [$"page must be 1 or greater; got {p}."];
        }

        if (s < 1 || s > D23Board.MaxSize)
        {
            errors["size"] = [$"size must be between 1 and {D23Board.MaxSize}; got {s}."];
        }

        if (!D23Board.Sorts.Contains(key))
        {
            errors["sort"] = [$"'{key}' is not a sort key. Try one of: "
                + string.Join(", ", D23Board.Sorts) + "."];
        }

        if (location is not null && !D23Board.Locations.Contains(location))
        {
            errors["location"] = [$"'{location}' is not a location. Try one of: "
                + string.Join(", ", D23Board.Locations) + "."];
        }

        if (minSalary is < 0)
        {
            errors["minSalary"] = ["minSalary cannot be negative."];
        }

        if (errors.Count > 0)
        {
            return TypedResults.ValidationProblem(errors);
        }

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
            string needle = "," + tag + ",";
            q = q.Where(x => ("," + x.Tags + ",").Contains(needle));
        }

        // Both round trips run over the SAME filtered query, so the total
        // describes the result set the page came out of.
        int total = await q.CountAsync();
        int totalPages = (total + s - 1) / s;

        q = key switch
        {
            "postedDay" => q.OrderBy(x => x.PostedDay).ThenBy(x => x.Id),
            "-postedDay" => q.OrderByDescending(x => x.PostedDay).ThenBy(x => x.Id),
            "salaryMax" => q.OrderBy(x => x.SalaryMax).ThenBy(x => x.Id),
            "-salaryMax" => q.OrderByDescending(x => x.SalaryMax).ThenBy(x => x.Id),
            _ => q.OrderBy(x => x.Title).ThenBy(x => x.Id),
        };

        var items = await q
            .Skip((p - 1) * s)
            .Take(s)
            .Select(D23Cards.Card)
            .ToListAsync();

        string? prev = p > 1 ? Link(p - 1) : null;
        string? next = p < totalPages ? Link(p + 1) : null;

        return TypedResults.Ok(new LinkedPage(items, p, s, total, totalPages, next, prev));

        // A navigation link that drops the filters points at a different
        // result set. Rebuild the whole query string, in a fixed order, and
        // only from what the client actually supplied.
        string Link(int target)
        {
            var url = new StringBuilder($"/d23/postings/search?page={target}&size={s}");
            if (sort is not null)
            {
                url.Append($"&sort={sort}");
            }

            if (remote is bool value)
            {
                // bool.ToString() is "True". The wire wants "true".
                url.Append($"&remote={(value ? "true" : "false")}");
            }

            if (location is not null)
            {
                url.Append($"&location={location}");
            }

            if (minSalary is int floorValue)
            {
                url.Append($"&minSalary={floorValue}");
            }

            if (tag is not null)
            {
                url.Append($"&tag={tag}");
            }

            return url.ToString();
        }
    }
}
