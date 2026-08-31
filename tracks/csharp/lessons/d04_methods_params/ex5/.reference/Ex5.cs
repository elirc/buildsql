// d04_methods_params / ex5 - which overload does the compiler pick?
// See lessons/d04_methods_params/README.md, "Exercise 5".

namespace CSharpDojo.D04_MethodsParams;

public static class Overloads
{
    /// <summary>Returns "int".</summary>
    public static string Describe(int value) => "int";

    /// <summary>Returns "long".</summary>
    public static string Describe(long value) => "long";

    /// <summary>Returns "double".</summary>
    public static string Describe(double value) => "double";

    /// <summary>Returns "object".</summary>
    public static string Describe(object value) => "object";

    /// <summary>Returns "params".</summary>
    public static string Describe(params int[] values) => "params";
}
