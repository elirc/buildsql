// i3_interview_rapidfire / ex1 - keys, where the state lives inside the row.
// See tracks/react/lessons/i3_interview_rapidfire/README.md, "Round 1".
import { useState } from "react";

type Player = { id: string; name: string };

function PlayerRow({ player }: { player: Player }) {
  const [score, setScore] = useState(0);

  return (
    <li>
      <span>
        {player.name}: {score}
      </span>
      <button type="button" onClick={() => setScore((previous) => previous + 1)}>
        Point for {player.name}
      </button>
    </li>
  );
}

export function ScoreBoard({
  initialPlayers,
  newcomer,
}: {
  initialPlayers: Player[];
  newcomer: Player;
}) {
  const [players, setPlayers] = useState(initialPlayers);

  return (
    <>
      <button type="button" onClick={() => setPlayers((previous) => [newcomer, ...previous])}>
        Add player to front
      </button>
      <ul>
        {players.map((player, index) => (
          <PlayerRow key={index} player={player} />
        ))}
      </ul>
    </>
  );
}
