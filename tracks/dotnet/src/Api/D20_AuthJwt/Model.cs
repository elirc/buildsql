// d20_auth_jwt - given code, not an exercise. Read it, do not edit it.
//
// A small engineering vault: entries that belong to somebody. Every exercise
// here is about what a TOKEN says and what the server is entitled to conclude
// from it.
//
// Two authentication schemes live in this lesson. "d20-bearer" is configured
// below, correctly, and every exercise from ex2 onwards uses it. "d20-strict"
// is registered by ex1 itself, badly, and fixing it is ex1.
//
// In a real service the signing key comes from user secrets or a key vault and
// is never a constant in a source file. It is one here so the gate and the
// application can agree with no configuration plumbing.

using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace DotnetDojo.Api.D20_AuthJwt;

public static class D20Jwt
{
    public const string Issuer = "dojo-d20";

    public const string Audience = "dojo-d20-clients";

    /// <summary>HMAC-SHA256 needs at least 256 bits of key, i.e. 32 bytes.</summary>
    public const string Key = "d20-signing-key-please-do-not-do-this-in-production";

    /// <summary>The scheme ex2 onwards use. Configured correctly, below.</summary>
    public const string Scheme = "d20-bearer";

    /// <summary>The scheme ex1 registers and has to fix.</summary>
    public const string StrictScheme = "d20-strict";

    public static SymmetricSecurityKey SigningKey => new(Encoding.UTF8.GetBytes(Key));
}

public static class D20Policies
{
    /// <summary>Any caller with a valid d20-bearer token.</summary>
    public const string Caller = "d20-caller";

    /// <summary>A valid d20-bearer token whose holder is in the "keeper" role.</summary>
    public const string Keeper = "d20-keeper";
}

public sealed class Entry
{
    public int Id { get; set; }

    /// <summary>The subject ("sub") of the token that created it.</summary>
    public string Owner { get; set; } = "";

    public string Title { get; set; } = "";

    public string Body { get; set; } = "";

    public bool Published { get; set; }
}

/// <summary>Singleton, so each gate's host gets its own copy and tests cannot leak into each other.</summary>
public sealed class D20Vault
{
    private readonly List<Entry> _entries =
    [
        new() { Id = 1, Owner = "ada", Title = "Rotor spec", Body = "titanium, 12 blades" },
        new() { Id = 2, Owner = "ada", Title = "Blade angles", Body = "17.5 degrees at root" },
        new() { Id = 3, Owner = "bo", Title = "Gearbox notes", Body = "ratio 4.1 to 1" },
        new() { Id = 4, Owner = "cy", Title = "Site survey", Body = "north ridge, sheltered" },
    ];

    public IReadOnlyList<Entry> All => _entries;

    public Entry? Find(int id) => _entries.FirstOrDefault(e => e.Id == id);

    public Entry Add(string owner, string title, string body)
    {
        var entry = new Entry
        {
            Id = _entries.Count == 0 ? 1 : _entries.Max(e => e.Id) + 1,
            Owner = owner,
            Title = title,
            Body = body,
        };

        _entries.Add(entry);

        return entry;
    }
}

public static class D20Scopes
{
    public const string Read = "entries:read";

    public const string Write = "entries:write";

    /// <summary>
    /// Given: the "scope" claim is one space-separated string, and a scope is
    /// present only as a WHOLE word in it. Use this, do not edit it.
    /// </summary>
    public static bool Has(System.Security.Claims.ClaimsPrincipal user, string scope) =>
        (user.FindFirst("scope")?.Value ?? "")
            .Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Contains(scope, StringComparer.Ordinal);
}

public record WhoAmI(string Name);

public record EntryDto(int Id, string Owner, string Title, string Body);

public record PreviewDto(string Title, string? Body);

public record NewEntry(string? Owner, string? Title, string? Body);

public record EntryUpdate(string? Owner, string? Title, string? Body);

public class D20Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<D20Vault>();

        // A NAMED scheme, added without touching the application's default -
        // several lessons in this track authenticate, and none of them may
        // change how the others do it.
        services
            .AddAuthentication()
            .AddJwtBearer(D20Jwt.Scheme, options =>
            {
                options.MapInboundClaims = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = D20Jwt.Issuer,
                    ValidateAudience = true,
                    ValidAudience = D20Jwt.Audience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = D20Jwt.SigningKey,
                    ValidateLifetime = true,
                    NameClaimType = "sub",
                    RoleClaimType = "role",
                };
            });

        services.AddAuthorizationBuilder()
            .AddPolicy(D20Policies.Caller, policy => policy
                .AddAuthenticationSchemes(D20Jwt.Scheme)
                .RequireAuthenticatedUser())
            .AddPolicy(D20Policies.Keeper, policy => policy
                .AddAuthenticationSchemes(D20Jwt.Scheme)
                .RequireAuthenticatedUser()
                .RequireRole("keeper"));
    }
}
