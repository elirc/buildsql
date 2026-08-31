// d03_results_statuscodes - given code, not an exercise. Read it, do not edit it.
//
// A hotel desk: three bookings, three rooms, and a store that mutates. Every
// gate in this lesson gets its own application instance, so one exercise's
// writes are invisible to the next.

namespace DotnetDojo.Api.D03_ResultsStatuscodes;

public record Booking(int Id, string Room, string Guest, string State);

public record NewBooking(string? Room, string? Guest);

public record StateChange(string? State);

public record QuoteRequest(string? Room, int Nights);

public record QuoteResponse(string Room, int Nights, int TotalCents);

public record Receipt(int BookingId, string Guest, string Room);

public record DeskRoom(int Id, string Name, int Capacity);

public record NewRoom(string? Name, int Capacity);

public static class Desk
{
    public static readonly string[] States = ["pending", "confirmed", "cancelled"];

    /// <summary>What one night in a room of this capacity costs, in cents.</summary>
    public const int NightlyRatePerHead = 1000;
}

public interface IDeskStore
{
    IReadOnlyList<Booking> Bookings();

    Booking? Find(int id);

    Booking Add(string room, string guest);

    bool Remove(int id);

    /// <summary>Writes the new state and returns the updated booking, or null if it is gone.</summary>
    Booking? SetState(int id, string state);

    IReadOnlyList<DeskRoom> Rooms();

    DeskRoom? FindRoom(int id);

    DeskRoom? FindRoom(string name);

    DeskRoom AddRoom(string name, int capacity);
}

public sealed class DeskStore : IDeskStore
{
    private readonly List<Booking> _bookings =
    [
        new(1, "Sakura", "Ada", "confirmed"),
        new(2, "Kiri", "Grace", "confirmed"),
        new(3, "Take", "Linus", "cancelled"),
    ];

    private readonly List<DeskRoom> _rooms =
    [
        new(1, "Sakura", 4),
        new(2, "Kiri", 8),
        new(3, "Take", 2),
    ];

    private int _nextBooking = 4;

    private int _nextRoom = 4;

    public IReadOnlyList<Booking> Bookings()
    {
        lock (_bookings)
        {
            return _bookings.ToList();
        }
    }

    public Booking? Find(int id)
    {
        lock (_bookings)
        {
            return _bookings.FirstOrDefault(b => b.Id == id);
        }
    }

    public Booking Add(string room, string guest)
    {
        lock (_bookings)
        {
            var booking = new Booking(_nextBooking++, room, guest, "pending");
            _bookings.Add(booking);

            return booking;
        }
    }

    public bool Remove(int id)
    {
        lock (_bookings)
        {
            return _bookings.RemoveAll(b => b.Id == id) > 0;
        }
    }

    public Booking? SetState(int id, string state)
    {
        lock (_bookings)
        {
            int index = _bookings.FindIndex(b => b.Id == id);
            if (index < 0)
            {
                return null;
            }

            var updated = _bookings[index] with { State = state };
            _bookings[index] = updated;

            return updated;
        }
    }

    public IReadOnlyList<DeskRoom> Rooms()
    {
        lock (_rooms)
        {
            return _rooms.ToList();
        }
    }

    public DeskRoom? FindRoom(int id)
    {
        lock (_rooms)
        {
            return _rooms.FirstOrDefault(r => r.Id == id);
        }
    }

    public DeskRoom? FindRoom(string name)
    {
        lock (_rooms)
        {
            return _rooms.FirstOrDefault(
                r => string.Equals(r.Name, name, StringComparison.OrdinalIgnoreCase));
        }
    }

    public DeskRoom AddRoom(string name, int capacity)
    {
        lock (_rooms)
        {
            var room = new DeskRoom(_nextRoom++, name, capacity);
            _rooms.Add(room);

            return room;
        }
    }
}

public class D03Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IDeskStore, DeskStore>();
    }
}
