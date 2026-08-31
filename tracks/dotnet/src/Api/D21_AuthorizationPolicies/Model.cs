// d21_authorization_policies - given code, not an exercise. Read it, do not edit it.
//
// A hospital shift roster. Every exercise here is about the authorization
// POLICY - the object that decides - rather than about the token, which is
// already valid by the time any of this runs.
//
// The scheme below is named "d21-bearer" and is configured correctly. Several
// lessons in this track authenticate; none of them may change how the others
// do it, which is why nothing here touches the application's default scheme.
//
// A token in this lesson may carry:
//   sub    - who is calling
//   role   - "charge" for a charge nurse, otherwise absent
//   ward   - the ward the caller works on ("cardio" or "neuro")
//   grade  - a number; 5 and up is senior, 8 and up is a ward lead

using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;

namespace DotnetDojo.Api.D21_AuthorizationPolicies;

public static class D21Jwt
{
    public const string Issuer = "dojo-d21";

    public const string Audience = "dojo-d21-clients";

    public const string Key = "d21-signing-key-please-do-not-do-this-in-production";

    public const string Scheme = "d21-bearer";

    public static SymmetricSecurityKey SigningKey => new(Encoding.UTF8.GetBytes(Key));
}

public static class D21Policies
{
    public const string OnWard = "d21-on-ward";

    public const string SameWard = "d21-same-ward";

    public const string Senior = "d21-senior";

    public const string WardLead = "d21-ward-lead";

    /// <summary>ex5, on the endpoint: any authenticated ward member.</summary>
    public const string Editor = "d21-editor";

    /// <summary>ex5, evaluated against a Shift with IAuthorizationService.</summary>
    public const string EditShift = "d21-edit-shift";

    public const string Ops = "d21-ops";

    /// <summary>ex7, on the endpoint.</summary>
    public const string Remover = "d21-remover";

    /// <summary>ex7, evaluated against a Shift.</summary>
    public const string DeleteShift = "d21-delete-shift";

    public const string Full = "d21-full";
}

public sealed class Shift
{
    public int Id { get; set; }

    public string Ward { get; set; } = "";

    /// <summary>The subject of the token that owns this shift.</summary>
    public string Doctor { get; set; } = "";

    public int Day { get; set; }

    public bool Locked { get; set; }
}

/// <summary>Singleton, so each gate's host gets its own roster.</summary>
public sealed class D21Roster
{
    private readonly List<Shift> _shifts =
    [
        new() { Id = 1, Ward = "cardio", Doctor = "ada", Day = 3, Locked = false },
        new() { Id = 2, Ward = "cardio", Doctor = "bo", Day = 4, Locked = true },
        new() { Id = 3, Ward = "neuro", Doctor = "cy", Day = 5, Locked = false },
        new() { Id = 4, Ward = "neuro", Doctor = "ada", Day = 6, Locked = false },
    ];

    public IReadOnlyList<Shift> All => _shifts;

    public Shift? Find(int id) => _shifts.FirstOrDefault(s => s.Id == id);

    public Shift Add(string ward, string doctor, int day)
    {
        var shift = new Shift
        {
            Id = _shifts.Count == 0 ? 1 : _shifts.Max(s => s.Id) + 1,
            Ward = ward,
            Doctor = doctor,
            Day = day,
        };

        _shifts.Add(shift);

        return shift;
    }

    public void Remove(Shift shift) => _shifts.Remove(shift);
}

/// <summary>Given: the requirement ex3 has to write a handler for.</summary>
public sealed class MinimumGradeRequirement(int grade) : IAuthorizationRequirement
{
    public int Grade { get; } = grade;
}

/// <summary>Given: the requirement ex4 satisfies from two different directions.</summary>
public sealed class WardLeadRequirement : IAuthorizationRequirement;

/// <summary>Given: the resource-based requirement ex5 evaluates against a Shift.</summary>
public sealed class ShiftOwnerRequirement : IAuthorizationRequirement;

/// <summary>Given: ex7's requirement. Two handlers look at it, and one of them vetoes.</summary>
public sealed class ShiftRemovalRequirement : IAuthorizationRequirement;

public static class D21Claims
{
    public const string Ward = "ward";

    public const string Grade = "grade";

    /// <summary>Given: the caller's grade, or 0 when they have none. Use it, do not edit it.</summary>
    public static int GradeOf(System.Security.Claims.ClaimsPrincipal user) =>
        int.TryParse(user.FindFirst(Grade)?.Value, out int grade) ? grade : 0;

    public static string? WardOf(System.Security.Claims.ClaimsPrincipal user) =>
        user.FindFirst(Ward)?.Value;
}

public record ShiftDto(int Id, string Ward, string Doctor, int Day, bool Locked);

public record DayChange(int Day);

public record NewShift(string? Ward, int Day);

public class D21Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<D21Roster>();

        services
            .AddAuthentication()
            .AddJwtBearer(D21Jwt.Scheme, options =>
            {
                options.MapInboundClaims = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = D21Jwt.Issuer,
                    ValidateAudience = true,
                    ValidAudience = D21Jwt.Audience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = D21Jwt.SigningKey,
                    ValidateLifetime = true,
                    NameClaimType = "sub",
                    RoleClaimType = "role",
                };
            });
    }
}
