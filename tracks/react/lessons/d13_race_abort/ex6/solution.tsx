// d13_race_abort / ex6 - one flag for every run is not enough flags.
// See tracks/react/lessons/d13_race_abort/README.md, "Exercise 6".
import { useEffect, useRef, useState } from "react";

export function PollenIndex({
  city,
  fetchIndex,
}: {
  city: string;
  fetchIndex: (city: string) => Promise<string>;
}) {
  const [index, setIndex] = useState<string | null>(null);
  const cancelled = useRef(false);

  useEffect(() => {
    setIndex(null);

    fetchIndex(city).then((next) => {
      if (cancelled.current) return;
      setIndex(next);
    });

    return () => {
      cancelled.current = true;
    };
  }, [city, fetchIndex]);

  if (index === null) {
    return <p role="status">Checking {city}</p>;
  }
  return (
    <p>
      Pollen in {city}: {index}
    </p>
  );
}
