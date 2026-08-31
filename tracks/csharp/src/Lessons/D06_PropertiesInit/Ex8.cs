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
        throw new NotImplementedException("ex8: the Settings constructor is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Read: the override if there is one, otherwise the default, otherwise "".
    /// Write: store an override - EXCEPT when the new value equals the default,
    /// which clears the override instead, so a setting nudged back to its
    /// default stops counting as modified.
    /// </summary>
    public string this[string key]
    {
        get => throw new NotImplementedException("ex8: the indexer getter is not implemented yet - edit this file.");
        set => throw new NotImplementedException("ex8: the indexer setter is not implemented yet - edit this file.");
    }

    /// <summary>True when anything is overridden.</summary>
    public bool IsModified => throw new NotImplementedException("ex8: IsModified is not implemented yet - edit this file.");

    /// <summary>The overridden keys, sorted ordinally.</summary>
    public IReadOnlyList<string> ModifiedKeys =>
        throw new NotImplementedException("ex8: ModifiedKeys is not implemented yet - edit this file.");

    /// <summary>Drop one override. A key that was not overridden is not an error.</summary>
    public void Reset(string key)
    {
        throw new NotImplementedException("ex8: Reset is not implemented yet - edit this file.");
    }

    /// <summary>Drop every override.</summary>
    public void ResetAll()
    {
        throw new NotImplementedException("ex8: ResetAll is not implemented yet - edit this file.");
    }
}
