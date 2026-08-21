// Gate for csharp/00_hello_dojo. Quoted verbatim in lessons/00_hello_dojo/README.md.
//
// One [Fact] per exercise. The method name starts with the exercise directory
// name (Ex1, Ex2, ...) so `dojo test csharp 00_hello_dojo ex2` can select it,
// and the class name starts with the lesson's folder prefix (L00_) so
// `dojo test csharp 00_hello_dojo` selects the whole lesson.
using CSharpDojo.L00_HelloDojo;

namespace CSharpDojo.Gates;

public class L00_HelloDojoTests
{
    [Fact]
    public void Ex1_GreetBuildsAGreetingFromAName()
    {
        Teach.Equal(
            "Hello, Eli! Welcome to the dojo.",
            Greeter.Greet("Eli"),
            "Greet(\"Eli\") must return exactly \"Hello, Eli! Welcome to the dojo.\" - "
                + "compare it character by character, punctuation included.");

        Teach.Equal(
            "Hello, Ada! Welcome to the dojo.",
            Greeter.Greet("Ada"),
            "The name has to come from the parameter, not be hard-coded - reread README ex1.");
    }

    [Fact]
    public void Ex2_DescribeAgreesWithItsOwnNumber()
    {
        Teach.Equal(
            "csharp: 14 lessons",
            TrackInfo.Describe("csharp", 14),
            "Describe(\"csharp\", 14) must return \"csharp: 14 lessons\".");

        Teach.Equal(
            "react: 1 lesson",
            TrackInfo.Describe("react", 1),
            "One lesson is a \"lesson\", not \"lessons\" - the plural is a decision your code "
                + "has to make, not a string you can interpolate once.");

        Teach.Equal(
            "dotnet: 0 lessons",
            TrackInfo.Describe("dotnet", 0),
            "Zero is plural in English: expect \"dotnet: 0 lessons\".");
    }

    [Fact]
    public void Ex3_LessonNumberReturnsAnInt()
    {
        Teach.Equal(
            7,
            SlugParser.LessonNumber("07_generics"),
            "LessonNumber(\"07_generics\") must return the int 7 - note \"07\" has a leading zero.");

        Teach.Equal(
            0,
            SlugParser.LessonNumber("00_hello_dojo"),
            "The first lesson is number 0. Parsing \"00\" gives 0, not an exception.");

        Teach.Equal(
            13,
            SlugParser.LessonNumber("13_async_await"),
            "Split on '_' and parse the first part - the rest of the slug can contain "
                + "more underscores, so take the first segment, not everything before the last one.");
    }
}
