// d13_race_abort / ex7 - reference solution.
import { useEffect, useState } from "react";

export type Trip = { id: string; traveller: string };

type Loaded = { traveller: string; legs: string[] };

export function ItineraryPanel({
  tripId,
  fetchTrip,
  fetchLegs,
}: {
  tripId: string;
  fetchTrip: (tripId: string) => Promise<Trip>;
  fetchLegs: (tripId: string) => Promise<string[]>;
}) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let current = true;
    setLoaded(null);

    fetchTrip(tripId).then((trip) => {
      // The check goes here as well, not only at the end: this is the point
      // where the component decides to spend a second request.
      if (!current) return;
      return fetchLegs(trip.id).then((legs) => {
        if (!current) return;
        setLoaded({ traveller: trip.traveller, legs });
      });
    });

    return () => {
      current = false;
    };
  }, [tripId, fetchTrip, fetchLegs]);

  if (loaded === null) {
    return <p role="status">Loading itinerary</p>;
  }

  return (
    <>
      <h2>{loaded.traveller}</h2>
      <ul>
        {loaded.legs.map((leg) => (
          <li key={leg}>{leg}</li>
        ))}
      </ul>
    </>
  );
}
