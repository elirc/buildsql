// d06_properties_init / ex7 - validation inside an init accessor.
// See lessons/d06_properties_init/README.md, "Exercise 7".

namespace CSharpDojo.D06_PropertiesInit;

public class Reservation
{
    private readonly int _guests;

    /// <summary>Who the table is for. The compiler insists on it.</summary>
    public required string Name { get; init; }

    /// <summary>
    /// How many people. Fewer than 1 is ArgumentOutOfRangeException - and the
    /// check belongs in the INIT ACCESSOR, so no Reservation can ever exist
    /// with a bad value.
    /// </summary>
    public required int Guests
    {
        get => throw new NotImplementedException("ex7: the Guests getter is not implemented yet - edit this file.");
        init => throw new NotImplementedException("ex7: the Guests init accessor is not implemented yet - edit this file.");
    }

    /// <summary>An optional note.</summary>
    public string? Note { get; init; }

    /// <summary>
    /// "Ada for 2", plus " (window)" when there is a note.
    /// </summary>
    public string Describe => throw new NotImplementedException("ex7: Describe is not implemented yet - edit this file.");

    /// <summary>
    /// A NEW reservation for a different number of guests, keeping the name and
    /// the note. The original is untouched, and the same validation applies.
    /// </summary>
    public Reservation WithGuests(int guests)
    {
        throw new NotImplementedException("ex7: WithGuests is not implemented yet - edit this file.");
    }
}
