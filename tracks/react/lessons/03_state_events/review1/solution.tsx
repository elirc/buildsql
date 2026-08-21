// 03_state_events / review1 - clamped state from a pair of buttons.
// See tracks/react/lessons/03_state_events/README.md, "Review".
import { useState } from "react";

export function Thermostat({ min, max }: { min: number; max: number }) {
  const [temperature] = useState(min);

  return (
    <>
      <output>{temperature}&deg;C</output>
      <button type="button">Warmer</button>
      <button type="button">Cooler</button>
    </>
  );
}
