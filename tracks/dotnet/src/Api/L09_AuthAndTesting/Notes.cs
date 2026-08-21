// 09_auth_and_testing - given code, not an exercise. Read it, do not edit it.
//
// The resource this lesson protects, and the signing key the gate's tokens are
// made with. In a real service the key comes from user secrets or a key vault
// (lesson 04) and is never a constant in a source file - it is one here so that
// the gate and the application can agree without any configuration plumbing.

using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace DotnetDojo.Api.L09_AuthAndTesting;

public static class JwtSettings
{
    public const string Issuer = "dojo";

    public const string Audience = "dojo-learners";

    /// <summary>HMAC-SHA256 needs at least 256 bits of key, i.e. 32 bytes.</summary>
    public const string Key = "dojo-signing-key-please-do-not-do-this-in-production";

    public static SymmetricSecurityKey SigningKey => new(Encoding.UTF8.GetBytes(Key));
}

public record Note(int Id, string Owner, string Text);

public record NewNote(string? Text, string? Owner);

public record UpdateNote(string? Text);

public interface INoteStore
{
    IReadOnlyList<Note> All();

    Note? Find(int id);

    Note Add(string owner, string text);

    bool Replace(int id, string text);
}

public sealed class NoteStore : INoteStore
{
    private readonly List<Note> _notes =
    [
        new(1, "ada", "ship the release"),
        new(2, "grace", "review the compiler"),
        new(3, "ada", "book the dojo"),
    ];

    private int _next = 4;

    public IReadOnlyList<Note> All()
    {
        lock (_notes)
        {
            return _notes.ToList();
        }
    }

    public Note? Find(int id)
    {
        lock (_notes)
        {
            return _notes.FirstOrDefault(n => n.Id == id);
        }
    }

    public Note Add(string owner, string text)
    {
        lock (_notes)
        {
            var note = new Note(_next++, owner, text);
            _notes.Add(note);
            return note;
        }
    }

    public bool Replace(int id, string text)
    {
        lock (_notes)
        {
            int index = _notes.FindIndex(n => n.Id == id);
            if (index < 0)
            {
                return false;
            }

            _notes[index] = _notes[index] with { Text = text };
            return true;
        }
    }
}

public class NotesServices : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<INoteStore, NoteStore>();
    }
}
