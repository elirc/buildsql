// 04_configuration_options / ex1 - bind a section to a class.
// See lessons/04_configuration_options/README.md, "Exercise 1".

using Microsoft.Extensions.Options;

namespace DotnetDojo.Api.L04_ConfigurationOptions;

/// <summary>The shape of the "Dojo:Catalog" section of appsettings.json.</summary>
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
        // TODO ex1: bind CatalogOptions to the "Dojo:Catalog" configuration section.
    }
}

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l04/catalog-options", GetCatalogOptions);
    }

    // 200 with {"title": …, "pageSize": …, "currency": …} read from the options.
    private static IResult GetCatalogOptions(IOptions<CatalogOptions> options) =>
        throw new NotImplementedException("ex1: GET /l04/catalog-options is not implemented yet - edit src/Api/L04_ConfigurationOptions/Ex1.cs");
}
