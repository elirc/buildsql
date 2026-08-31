// d06_async_await / ex1 - reference solution (author only, used by `dojo verify`).

export interface User {
  id: string;
  name: string;
  teamId: string;
}

export interface Team {
  id: string;
  name: string;
}

export interface ProfileDeps {
  findUser(id: string): Promise<User>;
  findTeam(teamId: string): Promise<Team>;
}

export interface Profile {
  id: string;
  name: string;
  team: string;
}

export async function loadProfile(id: string, deps: ProfileDeps): Promise<Profile> {
  // The second call needs a value only the first can produce, so the await is
  // load bearing rather than lazy - and it is why a rejection from findUser
  // means findTeam is never reached.
  const user = await deps.findUser(id);
  const team = await deps.findTeam(user.teamId);
  return { id: user.id, name: user.name, team: team.name };
}
