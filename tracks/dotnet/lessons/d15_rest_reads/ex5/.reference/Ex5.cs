// d15_rest_reads / ex5 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D15_RestReads;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d15/network", Summary);
    }

    private static IResult Summary(HttpContext http)
    {
        var summary = new NetworkSummary(
            D15Network.Stations.Count,
            D15Network.Bikes.Count,
            D15Network.Bikes.Count(b => b.Status == "available"));

        // The tag goes out on BOTH answers: on the 200 so the client can ask
        // next time, and on the 304 so it still has something to ask with.
        string tag = Tag(summary);
        http.Response.Headers.ETag = tag;

        if (http.Request.Headers.IfNoneMatch.Any(value => value == tag))
        {
            return TypedResults.StatusCode(StatusCodes.Status304NotModified);
        }

        return TypedResults.Ok(summary);
    }

    /// <summary>Given: a stable, quoted entity tag for any body. Use it, do not edit it.</summary>
    public static string Tag(object body)
    {
        string json = System.Text.Json.JsonSerializer.Serialize(body);
        byte[] hash = System.Security.Cryptography.SHA256.HashData(
            System.Text.Encoding.UTF8.GetBytes(json));
        return "\"" + Convert.ToHexString(hash)[..16] + "\"";
    }
}
