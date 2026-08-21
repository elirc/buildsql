// 04_lists_conditional / ex4 - deriving a view without disturbing the data.
// See tracks/react/lessons/04_lists_conditional/README.md, "Exercise 4".

type Player = { name: string; score: number };

export function Leaderboard({ players }: { players: Player[] }) {
  return (
    <ol>
      {players.map((player) => (
        <li key={player.name}>
          {player.name}: {player.score}
        </li>
      ))}
    </ol>
  );
}
