// 04_configuration_options / ex1 - reference solution (author only, used by `dojo verify`).

using Microsoft.Extensions.Options;

namespace DotnetDojo.Api.L04_ConfigurationOptions;

public class CatalogOptions
{
    public string Title { get; set; } = "";

    public int PageSize { get; set; }

    public string Currency { get; set; } = "";
}

public class Ex1Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<CatalogOptions>(configuration.GetSection("Dojo:Catalog"));
    }
}

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l04/catalog-options", GetCatalogOptions);
    }

    private static IResult GetCatalogOptions(IOptions<CatalogOptions> options) =>
        TypedResults.Ok(options.Value);
}
