// 10_linq_1 - the shared data model. You never edit this file; the gate builds
// sample orders from it and hands them to the methods you write.

namespace CSharpDojo.L10_Linq1;

/// <summary>One row of the "orders table" this lesson queries.</summary>
public record Order(int Id, string Customer, string Category, decimal Amount, int Year);
