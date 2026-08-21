// i3_interview_rapidfire / ex2 - deps and cleanup, on a subscription.
// See tracks/react/lessons/i3_interview_rapidfire/README.md, "Round 2".
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
  });

  return <p>{label}</p>;
}
