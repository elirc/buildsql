// d03_control_flow / ex5 - patterns: type, constant, property, and a guard.
// See lessons/d03_control_flow/README.md, "Exercise 5".

namespace CSharpDojo.D03_ControlFlow;

public static class Inspect
{
    /// <summary>
    /// Describe a value using ONE switch expression, in this order:
    /// null              -> "nothing"
    /// the int 0         -> "zero"
    /// a negative int    -> "negative int"
    /// any other int n   -> "int " + n
    /// an empty string   -> "empty string"
    /// any other string  -> "string of N"   (N = its length)
    /// an int[]          -> "array of N"    (N = its length)
    /// anything else     -> "something else"
    /// </summary>
    public static string Describe(object? value) => value switch
    {
        null => "nothing",
        0 => "zero",
        int and < 0 => "negative int",
        int n => $"int {n}",
        string { Length: 0 } => "empty string",
        string s => $"string of {s.Length}",
        int[] a => $"array of {a.Length}",
        _ => "something else",
    };
}
