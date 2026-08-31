// d15_rest_reads / ex8 - the whole read contract on one endpoint.
// See lessons/d15_rest_reads/README.md, "Exercise 8".

namespace DotnetDojo.Api.D15_RestReads;

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d15/stations/{code}/report", Report);
    }

    // 404 for a code that names no station. 400, as a validation problem
    // keyed "model", for a ?model= outside D15Network.Models. Otherwise 200
    // with a StationReport over the bikes docked there (narrowed by model
    // when one was given): docked, available, free = capacity - docked, and
    // the distinct models docked, A-Z. The response carries an ETag for the
    // representation it just produced, and answers 304 when the client's
    // If-None-Match matches it.
    private static IResult Report(string code, string? model, HttpContext http) =>
        throw new NotImplementedException(
            "ex8: GET /d15/stations/{code}/report is not implemented yet - edit src/Api/D15_RestReads/Ex8.cs");
}
