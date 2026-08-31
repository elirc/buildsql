// d10_effects_basics / ex1 - reference solution.
import { useEffect } from "react";

export function RoomJoiner({
  roomId,
  label,
  join,
}: {
  roomId: string;
  label: string;
  join: (roomId: string) => void;
}) {
  useEffect(() => {
    join(roomId);
  }, [roomId, join]);

  return (
    <>
      <p>In room {roomId}</p>
      <p>{label}</p>
    </>
  );
}
