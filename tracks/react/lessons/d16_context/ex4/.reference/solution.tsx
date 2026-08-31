// d16_context / ex4 - reference solution.
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type VolumeActions = { louder: () => void; quieter: () => void };

// Two channels, because two different sets of components care about two
// different things. The number changes constantly; the actions never do.
const VolumeValueContext = createContext<number | null>(null);
const VolumeActionsContext = createContext<VolumeActions | null>(null);

function useVolumeValue(): number {
  const value = useContext(VolumeValueContext);
  if (value === null) throw new Error("useVolumeValue must be used inside a VolumeProvider");
  return value;
}

function useVolumeActions(): VolumeActions {
  const value = useContext(VolumeActionsContext);
  if (value === null) throw new Error("useVolumeActions must be used inside a VolumeProvider");
  return value;
}

export function VolumeProvider({ children }: { children: ReactNode }) {
  const [volume, setVolume] = useState(5);

  // The updater form means these never need to close over the volume, so the
  // object can be built once and stay identical for the whole lifetime.
  const actions = useMemo<VolumeActions>(
    () => ({
      louder: () => setVolume((current) => current + 1),
      quieter: () => setVolume((current) => current - 1),
    }),
    [],
  );

  return (
    <VolumeValueContext.Provider value={volume}>
      <VolumeActionsContext.Provider value={actions}>{children}</VolumeActionsContext.Provider>
    </VolumeValueContext.Provider>
  );
}

export function VolumeReadout({ onRender }: { onRender: () => void }) {
  onRender();
  const volume = useVolumeValue();
  return <p role="status">Volume: {volume}</p>;
}

export function VolumeButtons({ onRender }: { onRender: () => void }) {
  onRender();
  const { louder, quieter } = useVolumeActions();
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
