// 03_state_events / review1 - reference solution.
import { useState } from "react";

export function Thermostat({ min, max }: { min: number; max: number }) {
  const [temperature, setTemperature] = useState(min);

  function shift(by: number) {
    setTemperature((previous) => Math.min(max, Math.max(min, previous + by)));
  }

  return (
    <>
      <output>{temperature}&deg;C</output>
      <button type="button" onClick={() => shift(1)}>
        Warmer
      </button>
      <button type="button" onClick={() => shift(-1)}>
        Cooler
      </button>
    </>
  );
}
