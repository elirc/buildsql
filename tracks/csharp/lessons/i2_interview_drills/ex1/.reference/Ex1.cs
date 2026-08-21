// i2_interview_drills / ex1 - FizzBuzz, with the twist. Time-box: 10 minutes.
// See lessons/i2_interview_drills/README.md, "Exercise 1".

namespace CSharpDojo.I2_InterviewDrills;

public static class FizzBuzz
{
    /// <summary>
    /// For each number from <paramref name="from"/> to <paramref name="to"/>
    /// inclusive: join the words of every rule whose divisor divides it, in
    /// rule order. A number matching no rule is its own text.
    /// Rules of (3, "Fizz") and (5, "Buzz") give the classic game.
    /// </summary>
    public static List<string> Run(int from, int to, IReadOnlyList<(int Divisor, string Word)> rules)
    {
        return Enumerable.Range(from, Math.Max(0, to - from + 1))
            .Select(number =>
            {
                string words = string.Concat(
                    rules.Where(rule => number % rule.Divisor == 0).Select(rule => rule.Word));
                return words.Length == 0 ? number.ToString() : words;
            })
            .ToList();
    }
}
