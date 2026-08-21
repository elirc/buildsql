// 04_inheritance_polymorphism / ex2 - base constructors and base method calls.
// See lessons/04_inheritance_polymorphism/README.md, "Exercise 2".

namespace CSharpDojo.L04_InheritancePolymorphism;

public class Employee
{
    public Employee(string name, decimal annualSalary)
    {
        Name = name;
        AnnualSalary = annualSalary;
    }

    public string Name { get; }

    public decimal AnnualSalary { get; }

    /// <summary>One twelfth of the annual salary, rounded to the cent.</summary>
    public virtual decimal MonthlyPay()
    {
        throw new NotImplementedException("ex2: Employee.MonthlyPay is not implemented yet - edit this file.");
    }
}

public class Manager : Employee
{
    /// <summary>
    /// A manager is an employee with a flat monthly bonus. Hand the name and
    /// salary to the base constructor rather than assigning them again here.
    /// </summary>
    public Manager(string name, decimal annualSalary, decimal monthlyBonus)
        : base(name, annualSalary)
    {
        MonthlyBonus = monthlyBonus;
    }

    public decimal MonthlyBonus { get; }

    /// <summary>The ordinary monthly pay, plus the bonus. Reuse, do not retype.</summary>
    public override decimal MonthlyPay()
    {
        throw new NotImplementedException("ex2: Manager.MonthlyPay is not implemented yet - edit this file.");
    }
}
