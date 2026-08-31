// d24_mixed_gauntlet / ex4 - EF Core projection under a query budget.
// See lessons/d24_mixed_gauntlet/README.md, "Exercise 4".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D24_MixedGauntlet;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d24/galleries", Galleries);
    }

    // One GalleryRow per gallery, gallery name A-Z, in at most two queries.
    // "sold" counts the NON-cancelled tickets on that gallery's exhibits.
    private static async Task<IResult> Galleries(D24Db db)
    {
        // TODO ex4: this is an N+1 loop - one query for the exhibits and then
        // one more per exhibit - and it counts cancelled tickets as sold.
        var rows = new List<GalleryRow>();

        foreach (var exhibit in await db.Exhibits.ToListAsync())
        {
            int sold = await db.Tickets.CountAsync(t => t.ExhibitId == exhibit.Id);

            var row = rows.FirstOrDefault(r => r.Gallery == exhibit.Gallery);
            if (row is null)
            {
                rows.Add(new GalleryRow(exhibit.Gallery, 1, sold));
            }
            else
            {
                rows[rows.IndexOf(row)] = row with
                {
                    Exhibits = row.Exhibits + 1,
                    Sold = row.Sold + sold,
                };
            }
        }

        return TypedResults.Ok(rows);
    }
}
