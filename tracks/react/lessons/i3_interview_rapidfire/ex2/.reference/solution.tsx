// i3_interview_rapidfire / ex2 - reference solution.
import { useEffect } from "react";

export function ChannelIndicator({
  channel,
  label,
  onSubscribe,
  onUnsubscribe,
}: {
  channel: string;
  label: string;
  onSubscribe: (channel: string) => void;
  onUnsubscribe: (channel: string) => void;
}) {
  useEffect(() => {
    onSubscribe(channel);
    return () => {
      onUnsubscribe(channel);
    };
  }, [channel, onSubscribe, onUnsubscribe]);

  return <p>{label}</p>;
}
