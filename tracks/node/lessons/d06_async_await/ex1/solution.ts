// d06_async_await / ex1 - when sequential is the right answer.
// See lessons/d06_async_await/README.md, "Problem 1".

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
  /** the team NAME */
  team: string;
}

export async function loadProfile(id: string, deps: ProfileDeps): Promise<Profile> {
  throw new Error("ex1: loadProfile() is not implemented yet - edit this file.");
}
