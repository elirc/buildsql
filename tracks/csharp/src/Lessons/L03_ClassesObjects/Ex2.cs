// 03_classes_objects / ex2 - init-only properties and computed properties.
// See lessons/03_classes_objects/README.md, "Exercise 2".

namespace CSharpDojo.L03_ClassesObjects;

public class LessonCard
{
    /// <summary>Assigned in an object initialiser, then frozen.</summary>
    public required string Slug { get; init; }

    public int Exercises { get; init; }

    public bool HasChallenge { get; init; }

    /// <summary>The core exercises plus the challenge, if there is one.</summary>
    public int TotalExercises => throw new NotImplementedException("ex2: TotalExercises is not implemented yet - edit this file.");

    /// <summary>
    /// "07_generics: 4 exercises + challenge", or without the "+ challenge"
    /// half when there is none. Exactly one exercise reads "1 exercise".
    /// </summary>
    public string Display => throw new NotImplementedException("ex2: Display is not implemented yet - edit this file.");
}
