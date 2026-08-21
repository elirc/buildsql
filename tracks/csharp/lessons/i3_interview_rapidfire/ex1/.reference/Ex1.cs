// i3_interview_rapidfire / ex1 - value semantics, cold. 3 minutes.
// See lessons/i3_interview_rapidfire/README.md, "Exercise 1".

namespace CSharpDojo.I3_InterviewRapidfire;

public struct Pixel
{
    public int Brightness;
}

public static class ValueSemantics
{
    /// <summary>
    /// Make an array holding one Pixel of Brightness 1, set
    /// array[0].Brightness = 9 directly, and return array[0].Brightness.
    /// </summary>
    public static int ThroughArray()
    {
        Pixel[] pixels = new[] { new Pixel { Brightness = 1 } };
        pixels[0].Brightness = 9;
        return pixels[0].Brightness;
    }

    /// <summary>
    /// The same with a List&lt;Pixel&gt; - except list[0].Brightness = 9 does
    /// not compile. Take a copy, change the copy, write it back to list[0], and
    /// return list[0].Brightness.
    /// </summary>
    public static int ThroughListWriteBack()
    {
        List<Pixel> pixels = new List<Pixel> { new Pixel { Brightness = 1 } };
        Pixel copy = pixels[0];
        copy.Brightness = 9;
        pixels[0] = copy;
        return pixels[0].Brightness;
    }

    /// <summary>Set the parameter's Brightness to 9 and return it.</summary>
    public static int Bump(Pixel pixel)
    {
        pixel.Brightness = 9;
        return pixel.Brightness;
    }
}
