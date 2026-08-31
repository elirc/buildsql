// d13_race_abort / ex7 - a chain that has to be abandoned in the middle.
// See tracks/react/lessons/d13_race_abort/README.md, "Exercise 7".
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

    fetchTrip(tripId)
      .then((trip) => fetchLegs(trip.id).then((legs) => ({ traveller: trip.traveller, legs })))
      .then((next) => {
        if (!current) return;
        setLoaded(next);
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
