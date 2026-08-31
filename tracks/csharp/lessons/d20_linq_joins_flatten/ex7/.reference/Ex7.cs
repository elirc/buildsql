// d20_linq_joins_flatten / ex7 - a report across three sequences.
// See lessons/d20_linq_joins_flatten/README.md, "Exercise 7".

namespace CSharpDojo.D20_LinqJoinsFlatten;

// The gate builds these. Written for you.
public record Student(int Id, string Name);

public record Course(int Id, string Title);

public record Enrolment(int StudentId, int CourseId, int Grade);

public static class Registry
{
    /// <summary>
    /// "ada/Maths=90" for every enrolment whose student AND course both exist,
    /// ordered by grade descending, then student name, then course title, both
    /// ordinal ascending.
    /// </summary>
    public static List<string> Transcript(
        IEnumerable<Student> students, IEnumerable<Course> courses, IEnumerable<Enrolment> enrolments)
    {
        return enrolments
            .Join(students, enrolment => enrolment.StudentId, student => student.Id,
                (enrolment, student) => new { enrolment.CourseId, enrolment.Grade, student.Name })
            .Join(courses, row => row.CourseId, course => course.Id,
                (row, course) => new { row.Name, course.Title, row.Grade })
            .OrderByDescending(row => row.Grade)
            .ThenBy(row => row.Name, StringComparer.Ordinal)
            .ThenBy(row => row.Title, StringComparer.Ordinal)
            .Select(row => $"{row.Name}/{row.Title}={row.Grade}")
            .ToList();
    }

    /// <summary>
    /// "Maths=85" for each course with at least one enrolment, using the
    /// integer average of the grades rounded DOWN, ordered by title (ordinal).
    /// Enrolments naming a course that does not exist are ignored.
    /// </summary>
    public static List<string> CourseAverages(
        IEnumerable<Course> courses, IEnumerable<Enrolment> enrolments)
    {
        return enrolments
            .Join(courses, enrolment => enrolment.CourseId, course => course.Id,
                (enrolment, course) => new { course.Title, enrolment.Grade })
            .GroupBy(row => row.Title)
            .OrderBy(group => group.Key, StringComparer.Ordinal)
            .Select(group => $"{group.Key}={group.Sum(row => row.Grade) / group.Count()}")
            .ToList();
    }
}
