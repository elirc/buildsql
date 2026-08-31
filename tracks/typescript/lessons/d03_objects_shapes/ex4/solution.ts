// d03_objects_shapes / ex4 - optional members, two levels down.
// See lessons/d03_objects_shapes/README.md, "ex4".

export interface Contact {
  email?: string;
}

export interface Owner {
  name?: string;
  contact?: Contact;
}

export interface OwnedPlaylist {
  name: string;
  owner?: Owner;
}

export function contactLine(playlist: OwnedPlaylist): string {
  throw new Error("ex4: contactLine() is not implemented yet - edit this file.");
}
