// d16_context / ex4 - one context carrying two unrelated things.
// See tracks/react/lessons/d16_context/README.md, "Exercise 4".
import { createContext, useContext, useState, type ReactNode } from "react";

type VolumeValue = { volume: number; louder: () => void; quieter: () => void };

const VolumeContext = createContext<VolumeValue | null>(null);

function useVolume(): VolumeValue {
  const value = useContext(VolumeContext);
  if (value === null) throw new Error("useVolume must be used inside a VolumeProvider");
  return value;
}

export function VolumeProvider({ children }: { children: ReactNode }) {
  const [volume, setVolume] = useState(5);

  const value: VolumeValue = {
    volume,
    louder: () => setVolume((current) => current + 1),
    quieter: () => setVolume((current) => current - 1),
  };

  return <VolumeContext.Provider value={value}>{children}</VolumeContext.Provider>;
}

export function VolumeReadout({ onRender }: { onRender: () => void }) {
  onRender();
  const { volume } = useVolume();
  return <p role="status">Volume: {volume}</p>;
}

export function VolumeButtons({ onRender }: { onRender: () => void }) {
  onRender();
  const { louder, quieter } = useVolume();
  return (
    <>
      <button type="button" onClick={louder}>
        Louder
      </button>
      <button type="button" onClick={quieter}>
        Quieter
      </button>
    </>
  );
}
