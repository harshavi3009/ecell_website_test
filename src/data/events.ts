// The list the Navbar's Events dropdown reads from. Add one entry here each
// time a new event is added (see "How to add a new event" in ARCHITECTURE.md).

export interface EventLink {
  name: string;
  slug: string;
}

export const events: EventLink[] = [
  { name: "Venture Vault 3.0", slug: "venture-vault-3" },
];
