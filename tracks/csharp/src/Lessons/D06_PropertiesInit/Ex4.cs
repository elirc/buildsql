// d06_properties_init / ex4 - a property with a body, and derived state.
// See lessons/d06_properties_init/README.md, "Exercise 4".

namespace CSharpDojo.D06_PropertiesInit;

public class VolumeControl
{
    private int _level = 50;

    /// <summary>
    /// The requested level, 0 to 100. Values outside the range are CLAMPED
    /// rather than rejected, and setting a level always unmutes.
    /// </summary>
    public int Level
    {
        get => throw new NotImplementedException("ex4: the Level getter is not implemented yet - edit this file.");
        set => throw new NotImplementedException("ex4: the Level setter is not implemented yet - edit this file.");
    }

    /// <summary>Muted or not. Only this class may change it.</summary>
    public bool Muted { get; private set; }

    /// <summary>What actually comes out of the speaker: 0 while muted.</summary>
    public int Effective => throw new NotImplementedException("ex4: Effective is not implemented yet - edit this file.");

    /// <summary>Silence the output without forgetting the level.</summary>
    public void Mute()
    {
        throw new NotImplementedException("ex4: Mute is not implemented yet - edit this file.");
    }

    /// <summary>Let the level through again.</summary>
    public void Unmute()
    {
        throw new NotImplementedException("ex4: Unmute is not implemented yet - edit this file.");
    }
}
