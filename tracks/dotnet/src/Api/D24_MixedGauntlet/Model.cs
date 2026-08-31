// d24_mixed_gauntlet - given code, not an exercise. Read it, do not edit it.
//
// A museum: exhibits with a fixed capacity, and tickets held against them. A
// cancelled ticket still exists as a row and no longer occupies a seat, which
// is the one domain rule every capacity question in this set turns on:
//
//     seats left = Capacity - (tickets on that exhibit where Cancelled is false)
//
// Everything a lesson SHARES lives here - the DbContext, the JWT scheme, the
// two policies, the options class, the problem-type base and the DTOs - so
// that an unfinished exercise can never stop the application starting. The
// signing key is a constant so the gate and the application can agree with no
// configuration plumbing; in a real service it comes from a key vault.

using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace DotnetDojo.Api.D24_MixedGauntlet;

public class Exhibit
{
    public int Id { get; set; }

    public string Name { get; set; } = "";

    /// <summary>"north" or "south". Several exhibits share a gallery.</summary>
    public string Gallery { get; set; } = "";

    /// <summary>How many people may hold a ticket at once. May be zero.</summary>
    public int Capacity { get; set; }

    public List<Ticket> Tickets { get; set; } = [];
}

public class Ticket
{
    public int Id { get; set; }

    public int ExhibitId { get; set; }

    public Exhibit? Exhibit { get; set; }

    /// <summary>The subject ("sub") of the token that holds it.</summary>
    public string Holder { get; set; } = "";

    /// <summary>Festival day, 1..7.</summary>
    public int Day { get; set; }

    /// <summary>A cancelled ticket is still a row and no longer holds a seat.</summary>
    public bool Cancelled { get; set; }
}

public class D24Db(DbContextOptions<D24Db> options) : DbContext(options)
{
    public DbSet<Exhibit> Exhibits => Set<Exhibit>();

    public DbSet<Ticket> Tickets => Set<Ticket>();
}

public static class D24Jwt
{
    public const string Issuer = "dojo-d24";

    public const string Audience = "dojo-d24-clients";

    /// <summary>HMAC-SHA256 needs at least 256 bits of key, i.e. 32 bytes.</summary>
    public const string Key = "d24-signing-key-please-do-not-do-this-in-production";

    /// <summary>A NAMED scheme, so no other lesson's default is disturbed.</summary>
    public const string Scheme = "d24-bearer";

    public static SymmetricSecurityKey SigningKey => new(Encoding.UTF8.GetBytes(Key));
}

public static class D24Policies
{
    /// <summary>Any caller with a valid d24-bearer token.</summary>
    public const string Visitor = "d24-visitor";

    /// <summary>A valid d24-bearer token whose holder is in the "curator" role.</summary>
    public const string Curator = "d24-curator";
}

/// <summary>Bound from the "Dojo:D24" configuration section. The default holds when nothing binds.</summary>
public sealed class D24Options
{
    public int MaxTicketsPerVisitor { get; set; } = 4;
}

public static class D24Problems
{
    /// <summary>Every problem type in this set is this base plus one slug.</summary>
    public const string Base = "https://dojo.test/problems/";
}

public record ExhibitDto(int Id, string Name, string Gallery, int Capacity);

public record TicketDto(int Id, int ExhibitId, string Holder, int Day, bool Cancelled);

public record VisitDto(string PerRequest, int Total);

public record NewReservation(int ExhibitId, string? Holder, int Count);

public record HeldDto(int Held);

public record GalleryRow(string Gallery, int Exhibits, int Sold);

public record NewTicket(string? Holder, int Day);

public record NewBooking(int ExhibitId, string? Holder, int Count);

public record BookingDto(int Id, int ExhibitId, string Holder, List<int> TicketIds);

public class D24Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // The gates replace this with a private in-memory database, per test.
        services.AddDbContext<D24Db>(options => options.UseSqlite("Data Source=dojo-d24.db"));

        services
            .AddAuthentication()
            .AddJwtBearer(D24Jwt.Scheme, options =>
            {
                options.MapInboundClaims = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = D24Jwt.Issuer,
                    ValidateAudience = true,
                    ValidAudience = D24Jwt.Audience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = D24Jwt.SigningKey,
                    ValidateLifetime = true,
                    NameClaimType = "sub",
                    RoleClaimType = "role",
                };
            });

        // Both policies name the scheme explicitly. Without that they run
        // against the application default, which this lesson never sets.
        services.AddAuthorizationBuilder()
            .AddPolicy(D24Policies.Visitor, policy => policy
                .AddAuthenticationSchemes(D24Jwt.Scheme)
                .RequireAuthenticatedUser())
            .AddPolicy(D24Policies.Curator, policy => policy
                .AddAuthenticationSchemes(D24Jwt.Scheme)
                .RequireAuthenticatedUser()
                .RequireRole("curator"));

        // Nothing configures this section in the shipped appsettings, so the
        // class default of 4 is what holds until a gate says otherwise.
        services.Configure<D24Options>(configuration.GetSection("Dojo:D24"));
    }
}
