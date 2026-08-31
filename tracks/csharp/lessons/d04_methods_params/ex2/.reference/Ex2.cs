// d04_methods_params / ex2 - params arrays.
// See lessons/d04_methods_params/README.md, "Exercise 2".

namespace CSharpDojo.D04_MethodsParams;

public static class Paths
{
    /// <summary>
    /// Join the parts with "/", ignoring any part that is null or blank and
    /// stripping "/" from both ends of every part first, so no double slash
    /// can appear. No parts at all gives "".
    /// </summary>
    public static string Combine(params string?[] parts)
    {
        List<string> kept = new List<string>();
        foreach (string? part in parts)
        {
            if (string.IsNullOrWhiteSpace(part))
            {
                continue;
            }

            string trimmed = part.Trim().Trim('/');
            if (trimmed.Length > 0)
            {
                kept.Add(trimmed);
            }
        }

        return string.Join("/", kept);
    }

    /// <summary>
    /// The first candidate that is not null or blank, trimmed. When there is
    /// none - including when no candidates were passed at all - "".
    /// </summary>
    public static string First(params string?[] candidates)
    {
        foreach (string? candidate in candidates)
        {
            if (!string.IsNullOrWhiteSpace(candidate))
            {
                return candidate.Trim();
            }
        }

        return "";
    }
}
