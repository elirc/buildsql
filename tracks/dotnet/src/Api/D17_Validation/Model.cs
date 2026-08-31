// d17_validation - given code, not an exercise. Read it, do not edit it.
//
// A veterinary clinic's booking desk. Nothing here is stored: every exercise
// is about deciding whether a request is acceptable and, when it is not,
// saying so in a shape a client can act on. The gates read the "errors"
// dictionary of the validation problem key by key, so the KEY you file an
// error under matters as much as the fact that you filed one.

namespace DotnetDojo.Api.D17_Validation;

public sealed record Vet(string Code, string Name, IReadOnlyList<string> Treats);

public static class D17Clinic
{
    public static readonly IReadOnlyList<string> Species = ["cat", "dog", "rabbit", "exotic"];

    public static readonly IReadOnlyList<Vet> Vets =
    [
        new("ash", "Ash Merrow", ["cat", "dog"]),
        new("bo", "Bo Lindqvist", ["rabbit", "exotic"]),
        new("cy", "Cy Okafor", ["cat", "dog", "rabbit"]),
    ];

    public const int OpensHour = 8;

    public const int ClosesHour = 18;

    public const int MinMinutes = 10;

    public const int MaxMinutes = 120;

    public static Vet? Find(string? code) => Vets.FirstOrDefault(v => v.Code == code);
}

public record VisitRequest(string? PetName, string? Species, int DurationMinutes);

public record VisitAccepted(string PetName, string Species, int DurationMinutes);

public record OwnerRequest(string? Name, string? Email, string? Phone);

public record OwnerAccepted(string Name, string Email, string Phone);

public record SlotRequest(int StartHour, int DurationMinutes);

/// <summary>Minutes since midnight, so a 90-minute slot is expressible.</summary>
public record SlotAccepted(int StartMinute, int EndMinute);

public record RoundRequest(List<VisitRequest>? Visits);

public record RoundAccepted(int Visits, int TotalMinutes);

public record AddressBlock(string? Line1, string? Postcode);

public record OwnerBlock(string? Name, AddressBlock? Address);

public record PetBlock(string? Name, string? Species);

public record RegistrationRequest(OwnerBlock? Owner, PetBlock? Pet);

public record RegistrationAccepted(string Owner, string Postcode, string Pet, string Species);

public record ExoticRequest(string? Species, string? PermitNumber, bool Sedation, string? SedationNote);

public record ExoticAccepted(string Species, string? PermitNumber, bool Sedation);

public record AppointmentRequest(string? Species, int StartHour, int DurationMinutes);

public record AppointmentAccepted(string Vet, string Species, int StartMinute, int EndMinute);

public record BookingRequest(string? VetCode, OwnerBlock? Owner, List<VisitRequest>? Visits, int StartHour);

public record BookingAccepted(
    string Reference,
    string VetCode,
    string Owner,
    List<string> Pets,
    int StartMinute,
    int EndMinute);
