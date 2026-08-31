// d13_race_abort / ex1 - reference solution.
import { useEffect, useState } from "react";

export function StationBoard({
  station,
  fetchDepartures,
}: {
  station: string;
  fetchDepartures: (station: string) => Promise<string[]>;
}) {
  const [departures, setDepartures] = useState<string[] | null>(null);

  useEffect(() => {
    // Declared inside the effect body, so every run gets its own flag and the
    // cleanup below flips exactly the one belonging to the request it retires.
    let current = true;

    setDepartures(null);
    fetchDepartures(station).then((next) => {
      if (!current) return;
      setDepartures(next);
    });

    return () => {
      current = false;
    };
  }, [station, fetchDepartures]);

  if (departures === null) {
    return <p role="status">Loading departures for {station}</p>;
  }

  return (
    <ul>
      {departures.map((departure) => (
        <li key={departure}>{departure}</li>
      ))}
    </ul>
  );
}
