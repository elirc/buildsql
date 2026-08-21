// 00_hello_dojo / ex3 - reference solution (author only, used by `dojo verify`).
// Overlaid onto src/Lessons/L00_HelloDojo/Ex3.cs during verification.

namespace CSharpDojo.L00_HelloDojo;

public static class SlugParser
{
    public static int LessonNumber(string slug)
    {
        return int.Parse(slug.Split('_')[0]);
    }
}
