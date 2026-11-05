export interface SeedPerson {
  slug: string;
  name: string;
  bio: string;
}

export const PEOPLE: SeedPerson[] = [
  {
    slug: 'maren',
    name: 'Maren Oyelaran',
    bio: 'Coastal naturalist. Writes about what the tide leaves behind, and what it takes back.',
  },
  {
    slug: 'ivo',
    name: 'Ivo Brekke',
    bio: 'Keeper of a ledger, walker of lines. Interested in anything with an insulator in it.',
  },
  {
    slug: 'wren',
    name: 'Wren Sato',
    bio: 'Makes small atlases of ordinary weather. Folds paper maps badly, on purpose.',
  },
  {
    slug: 'nadia',
    name: 'Nadia Falk',
    bio: 'Harbour rules, moth lists, and the addresses of places that no longer exist.',
  },
  {
    slug: 'tomas',
    name: 'Tomas Vey',
    bio: 'Follows old paths and the people who cut them. Carries a bad knee and a good flask.',
  },
  {
    slug: 'osric',
    name: 'Osric Bell',
    bio: 'Retired schoolmaster. Compiles almanacs nobody asked for, and is usually right.',
  },
];
