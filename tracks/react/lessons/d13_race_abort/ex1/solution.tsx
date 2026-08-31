// d13_race_abort / ex1 - the abandoned request that answers last.
// See tracks/react/lessons/d13_race_abort/README.md, "Exercise 1".
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
    setDepartures(null);
    fetchDepartures(station).then((next) => {
      setDepartures(next);
    });
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
