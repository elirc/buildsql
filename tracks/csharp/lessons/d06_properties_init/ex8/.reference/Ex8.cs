// d06_properties_init / ex8 - an indexer over defaults and overrides.
// See lessons/d06_properties_init/README.md, "Exercise 8".

namespace CSharpDojo.D06_PropertiesInit;

public class Settings
{
    private readonly Dictionary<string, string> _defaults = new Dictionary<string, string>();
    private readonly Dictionary<string, string> _overrides = new Dictionary<string, string>();

    /// <summary>The shipped defaults, COPIED so the caller cannot rewrite them later.</summary>
    public Settings(IReadOnlyDictionary<string, string> defaults)
    {
        foreach (KeyValuePair<string, string> pair in defaults)
        {
            _defaults[pair.Key] = pair.Value;
        }
    }

    /// <summary>
    /// Read: the override if there is one, otherwise the default, otherwise "".
    /// Write: store an override - EXCEPT when the new value equals the default,
    /// which clears the override instead, so a setting nudged back to its
    /// default stops counting as modified.
    /// </summary>
    public string this[string key]
    {
        get
        {
            if (_overrides.TryGetValue(key, out string? overridden))
            {
                return overridden;
            }

            return _defaults.TryGetValue(key, out string? shipped) ? shipped : "";
        }

        set
        {
            if (_defaults.TryGetValue(key, out string? shipped) && shipped == value)
            {
                _overrides.Remove(key);
                return;
            }

            _overrides[key] = value;
        }
    }

    /// <summary>True when anything is overridden.</summary>
    public bool IsModified => _overrides.Count > 0;

    /// <summary>The overridden keys, sorted ordinally.</summary>
    public IReadOnlyList<string> ModifiedKeys =>
        _overrides.Keys.OrderBy(key => key, StringComparer.Ordinal).ToList();

    /// <summary>Drop one override. A key that was not overridden is not an error.</summary>
    public void Reset(string key)
    {
        _overrides.Remove(key);
    }

    /// <summary>Drop every override.</summary>
    public void ResetAll()
    {
        _overrides.Clear();
    }
}
