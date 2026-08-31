// d13_race_abort / ex6 - reference solution.
import { useEffect, useState } from "react";

export function PollenIndex({
  city,
  fetchIndex,
}: {
  city: string;
  fetchIndex: (city: string) => Promise<string>;
}) {
  const [index, setIndex] = useState<string | null>(null);

  useEffect(() => {
    // A ref is one box shared by every run of this effect. A `let` in the
    // effect body is a new box per run, which is what "this request" means.
    let current = true;
    setIndex(null);

    fetchIndex(city).then((next) => {
      if (!current) return;
      setIndex(next);
    });

    return () => {
      current = false;
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
