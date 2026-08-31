// d10_effects_basics / ex1 - one join per room, whatever else re-renders.
// See tracks/react/lessons/d10_effects_basics/README.md, "Exercise 1".
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
  });

  return (
    <>
      <p>In room {roomId}</p>
      <p>{label}</p>
    </>
  );
}
