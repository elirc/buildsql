// i2_interview_drills - shared types. You never edit this file.

namespace CSharpDojo.I2_InterviewDrills;

/// <summary>Stands in for a database connection in ex4.</summary>
public interface IConnection
{
    void Execute(string command);
}

/// <summary>A person, for ex6.</summary>
public record Contact(string Name, string Email);
