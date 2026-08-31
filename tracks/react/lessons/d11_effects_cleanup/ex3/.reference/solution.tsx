// d11_effects_cleanup / ex3 - reference solution.
import { useEffect } from "react";

export function ChannelSwitch({
  channel,
  connect,
}: {
  channel: string;
  connect: (channel: string) => () => void;
}) {
  useEffect(() => {
    const disconnect = connect(channel);
    return disconnect;
  }, [channel, connect]);

  return <p role="status">Listening to {channel}</p>;
}
