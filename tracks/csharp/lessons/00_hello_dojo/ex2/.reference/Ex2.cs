// 00_hello_dojo / ex2 - reference solution (author only, used by `dojo verify`).
// Overlaid onto src/Lessons/L00_HelloDojo/Ex2.cs during verification.

namespace CSharpDojo.L00_HelloDojo;

public static class TrackInfo
{
    public static string Describe(string name, int lessons)
    {
        string noun = lessons == 1 ? "lesson" : "lessons";
        return $"{name}: {lessons} {noun}";
    }
}
