// d14_projections_dtos / ex8 - the whole dashboard on a query budget.
// See lessons/d14_projections_dtos/README.md, "Exercise 8".

namespace DotnetDojo.Api.D14_ProjectionsDtos;

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d14/dashboard", Get);
    }

    // 200 with a Dashboard:
    //   films      - how many films exist
    //   screenings - how many screenings exist
    //   seatsSold  - total tickets sold across all screenings
    //   soldOut    - how many screenings are sold out (sold >= seats)
    //   top        - the top THREE films by percent sold, as TopFilms:
    //                sum(sold) * 100 / sum(seats) over the film's screenings,
    //                integer division, films with no screenings excluded,
    //                highest percent first, ties broken by title A-Z.
    // At most three SQL queries for all of it.
    private static Task<IResult> Get(D14Db db) =>
        throw new NotImplementedException(
            "ex8: GET /d14/dashboard is not implemented yet - edit src/Api/D14_ProjectionsDtos/Ex8.cs");
}
