// i2_interview_drills - given code, not an exercise. Read it, do not edit it.
//
// Everything the six drills need except the code you are being asked to write:
// a catalogue, three little stores, a JWT scheme, and a handler that throws on
// demand. Skim it once before you start so you are not reading it under a
// time-box.

using System.Collections.Concurrent;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace DotnetDojo.Api.I2_InterviewDrills;

// -- ex1: a catalogue to page through ----------------------------------------

public record Book(int Id, string Title, string Author, int Year);

public static class Library
{
    public static readonly IReadOnlyList<Book> Books =
    [
        new(1, "Dune", "Herbert", 1965),
        new(2, "Emma", "Austen", 1815),
        new(3, "Persuasion", "Austen", 1817),
        new(4, "Neuromancer", "Gibson", 1984),
        new(5, "Foundation", "Asimov", 1951),
        new(6, "Idoru", "Gibson", 1996),
    ];
}

// -- ex2: a fixed-window counter ---------------------------------------------

public interface IRequestCounter
{
    /// <summary>Counts one request for this key and returns the new total.</summary>
    int Increment(string key);
}

public sealed class RequestCounter : IRequestCounter
{
    private readonly ConcurrentDictionary<string, int> _hits = new();

    public int Increment(string key) => _hits.AddOrUpdate(key, 1, (_, n) => n + 1);
}

// -- ex3: a key/value store that says whether it created something ------------

public record SettingValue(string? Value);

public interface ISettingStore
{
    string? Get(string key);

    /// <summary>Stores the value. Returns true if the key did not exist before.</summary>
    bool Set(string key, string value);
}

public sealed class SettingStore : ISettingStore
{
    private readonly ConcurrentDictionary<string, string> _values = new();

    public string? Get(string key) => _values.TryGetValue(key, out string? value) ? value : null;

    public bool Set(string key, string value)
    {
        bool created = !_values.ContainsKey(key);
        _values[key] = value;
        return created;
    }
}

// -- ex4 and the challenge: this lesson's own bearer scheme -------------------

public static class I2Jwt
{
    /// <summary>Its own scheme name, so it cannot collide with lesson 09's.</summary>
    public const string Scheme = "i2-bearer";

    public const string Issuer = "dojo-drills";

    public const string Audience = "dojo-candidates";

    public const string Key = "drills-signing-key-that-is-comfortably-long-enough";

    public static SymmetricSecurityKey SigningKey => new(Encoding.UTF8.GetBytes(Key));
}

public record AuditEntry(int Id, string Action);

public static class AuditLog
{
    public static readonly IReadOnlyList<AuditEntry> Entries =
    [
        new(1, "user.created"),
        new(2, "order.shipped"),
    ];
}

// -- ex5: something that throws ----------------------------------------------

public class DrillNotFoundException(string message) : Exception(message);

public static class DrillTrap
{
    public const string Secret = "internal token sk_live_9f2b1c";

    public static Task Handle(HttpContext context)
    {
        string path = context.Request.Path.Value ?? "";

        if (path.EndsWith("/missing", StringComparison.Ordinal))
        {
            throw new DrillNotFoundException("no such drill");
        }

        if (path.EndsWith("/boom", StringComparison.Ordinal))
        {
            throw new InvalidOperationException(Secret);
        }

        return context.Response.WriteAsync("ok");
    }
}

// -- the challenge: a per-user note resource ---------------------------------

public record DrillNote(int Id, string Owner, string Text);

public record NewDrillNote(string? Text);

public interface IDrillNoteStore
{
    IReadOnlyList<DrillNote> All();

    DrillNote Add(string owner, string text);
}

public sealed class DrillNoteStore : IDrillNoteStore
{
    private readonly List<DrillNote> _notes =
    [
        new(1, "ada", "alpha"),
        new(2, "ada", "beta"),
        new(3, "grace", "gamma"),
        new(4, "ada", "delta"),
        new(5, "ada", "epsilon"),
    ];

    private int _next = 6;

    public IReadOnlyList<DrillNote> All()
    {
        lock (_notes)
        {
            return _notes.ToList();
        }
    }

    public DrillNote Add(string owner, string text)
    {
        lock (_notes)
        {
            var note = new DrillNote(_next++, owner, text);
            _notes.Add(note);
            return note;
        }
    }
}

// -- review1: orders, and the keys that stop them being made twice -------------

public record DrillOrder(int Id, string Item);

public record NewDrillOrder(string? Item);

public interface IDrillOrderStore
{
    int Count { get; }

    DrillOrder? Find(int id);

    DrillOrder Add(string item);

    /// <summary>Idempotency-Key -> the id of the order it produced.</summary>
    ConcurrentDictionary<string, int> Keys { get; }
}

public sealed class DrillOrderStore : IDrillOrderStore
{
    private readonly List<DrillOrder> _orders = [];

    private int _next = 1;

    public ConcurrentDictionary<string, int> Keys { get; } = new();

    public int Count
    {
        get
        {
            lock (_orders)
            {
                return _orders.Count;
            }
        }
    }

    public DrillOrder? Find(int id)
    {
        lock (_orders)
        {
            return _orders.FirstOrDefault(o => o.Id == id);
        }
    }

    public DrillOrder Add(string item)
    {
        lock (_orders)
        {
            var order = new DrillOrder(_next++, item);
            _orders.Add(order);
            return order;
        }
    }
}

public class I2Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IRequestCounter, RequestCounter>();
        services.AddSingleton<ISettingStore, SettingStore>();
        services.AddSingleton<IDrillNoteStore, DrillNoteStore>();
        services.AddSingleton<IDrillOrderStore, DrillOrderStore>();

        // This lesson's own bearer scheme, registered here so that two
        // exercises can both require it without fighting over the name.
        services
            .AddAuthentication()
            .AddJwtBearer(I2Jwt.Scheme, options =>
            {
                options.MapInboundClaims = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = I2Jwt.Issuer,
                    ValidateAudience = true,
                    ValidAudience = I2Jwt.Audience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = I2Jwt.SigningKey,
                    ValidateLifetime = true,
                    NameClaimType = "sub",
                    RoleClaimType = "role",
                };
            });

        services.AddAuthorization();
    }
}
