// d11_efcore_queries - given code, not an exercise. Read it, do not edit it.
//
// Students, courses and the enrolments between them. Every exercise in this
// lesson only ever reads.

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D11_EfcoreQueries;

public class Student
{
    public int Id { get; set; }

    public string Name { get; set; } = "";

    public string Country { get; set; } = "";

    public List<Enrolment> Enrolments { get; set; } = [];
}

public class Course
{
    public int Id { get; set; }

    public string Title { get; set; } = "";

    public string Subject { get; set; } = "";

    public int Credits { get; set; }

    public List<Enrolment> Enrolments { get; set; } = [];
}

public class Enrolment
{
    public int Id { get; set; }

    public int StudentId { get; set; }

    public Student? Student { get; set; }

    public int CourseId { get; set; }

    public Course? Course { get; set; }

    public int Score { get; set; }
}

public class D11Db(DbContextOptions<D11Db> options) : DbContext(options)
{
    public DbSet<Student> Students => Set<Student>();

    public DbSet<Course> Courses => Set<Course>();

    public DbSet<Enrolment> Enrolments => Set<Enrolment>();
}

public record CourseSummary(int Id, string Title, int Credits);

public record SubjectTotals(string Subject, int Courses, int TotalCredits);

public record CourseStats(string Title, int Enrolled, int AverageScore);

public record EnrolmentItem(int Id, int Score);

public record EnrolmentPage(List<EnrolmentItem> Items, int Total, int Page, int Size);

public record OverviewRow(int EnrolmentId, string Student, string Course, int Score);

public record StudentDetail(string Name, List<string> Courses);

public record SearchRow(string Student, string Course, int Score);

public record SearchPage(List<SearchRow> Items, int Total);

public class D11Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // The gates replace this with a private in-memory database, per test.
        services.AddDbContext<D11Db>(options => options.UseSqlite("Data Source=dojo-d11.db"));
    }
}
