// d03_objects_shapes / ex4 - reference solution (author only).

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
  const name = playlist.owner?.name?.trim();
  const email = playlist.owner?.contact?.email?.trim();
  return `${name ? name : "anonymous"} <${email ? email : "no email"}>`;
}
