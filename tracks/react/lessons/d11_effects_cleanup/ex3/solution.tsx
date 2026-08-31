// d11_effects_cleanup / ex3 - leave the old channel before joining the new one.
// See tracks/react/lessons/d11_effects_cleanup/README.md, "Exercise 3".
import { useEffect, useRef } from "react";

export function ChannelSwitch({
  channel,
  connect,
}: {
  channel: string;
  connect: (channel: string) => () => void;
}) {
  const disconnect = useRef<(() => void) | null>(null);

  useEffect(() => {
    disconnect.current?.();
    disconnect.current = connect(channel);
  }, [channel, connect]);

  return <p role="status">Listening to {channel}</p>;
}
