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
        get => _level;
        set
        {
            _level = Math.Clamp(value, 0, 100);
            Muted = false;
        }
    }

    /// <summary>Muted or not. Only this class may change it.</summary>
    public bool Muted { get; private set; }

    /// <summary>What actually comes out of the speaker: 0 while muted.</summary>
    public int Effective => Muted ? 0 : _level;

    /// <summary>Silence the output without forgetting the level.</summary>
    public void Mute()
    {
        Muted = true;
    }

    /// <summary>Let the level through again.</summary>
    public void Unmute()
    {
        Muted = false;
    }
}
