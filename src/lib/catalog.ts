export type Album = {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  genre: string;
  color: string;
  art: string;
  year: number;
  description: string;
};
export type Track = {
  id: string;
  title: string;
  albumId: string;
  duration: number;
  notes: number[];
};

export const albums: Album[] = [
  {
    id: 'slow-shapes',
    title: 'slow shapes',
    artist: 'serein',
    artistId: 'serein',
    genre: 'ambient',
    color: '#cdd3c4',
    art: 'rings',
    year: 2026,
    description:
      'небольшие формы, длинные паузы. три фрагмента для медленного утра.',
  },
  {
    id: 'after-hours',
    title: 'after hours',
    artist: 'sunday service',
    artistId: 'sunday-service',
    genre: 'electronic',
    color: '#d45639',
    art: 'stripes',
    year: 2026,
    description:
      'город после полуночи: тёплый бас, неровный ритм и воздух между ними.',
  },
  {
    id: 'blue-room',
    title: 'blue room',
    artist: 'low district',
    artistId: 'low-district',
    genre: 'downtempo',
    color: '#879eb9',
    art: 'sphere',
    year: 2026,
    description:
      'комната, в которой можно никуда не торопиться. звук становится пространством.',
  },
  {
    id: 'soft-focus',
    title: 'soft focus',
    artist: 'forma',
    artistId: 'forma',
    genre: 'house',
    color: '#e4d995',
    art: 'square',
    year: 2026,
    description: 'мягкий свет и ровный пульс. спокойный танцевальный релиз.',
  },
  {
    id: 'open-fields',
    title: 'open fields',
    artist: 'parallel',
    artistId: 'parallel',
    genre: 'experimental',
    color: '#b8aab9',
    art: 'ellipse',
    year: 2025,
    description:
      'пространство за городом и музыка без спешки. три открытых горизонта.',
  },
  {
    id: 'side-b',
    title: 'side b',
    artist: 'common ground',
    artistId: 'common-ground',
    genre: 'broken beat',
    color: '#cbc5bb',
    art: 'diagonal',
    year: 2025,
    description:
      'вторая сторона знакомого ритма. сухие удары, немного тепла, много воздуха.',
  },
];

const titles = [
  ['first light', 'slow shapes', 'still here'],
  ['after hours', 'last train', 'no rush'],
  ['blue room', 'thin walls', 'window seat'],
  ['soft focus', 'daylight', 'easy now'],
  ['open fields', 'far away', 'back home'],
  ['side b', 'common ground', 'one more'],
];
const chords = [
  [130.81, 164.81, 196, 261.63],
  [146.83, 174.61, 220, 293.66],
  [123.47, 146.83, 185, 246.94],
  [164.81, 196, 246.94, 329.63],
  [110, 130.81, 164.81, 220],
  [138.59, 164.81, 207.65, 277.18],
];
export const tracks: Track[] = albums.flatMap((album, i) =>
  titles[i].map((title, j) => ({
    id: `${album.id}-${j + 1}`,
    title,
    albumId: album.id,
    duration: 45,
    notes: chords[i].map((n) => n * (j === 1 ? 1.12246 : 1)),
  })),
);
export const playlists = [
  {
    id: 'slow-morning',
    title: 'медленное утро',
    subtitle: 'ambient · 6 демо-фрагментов',
    color: '#cdd3c4',
    ids: tracks
      .filter((t) => ['slow-shapes', 'blue-room'].includes(t.albumId))
      .map((t) => t.id),
  },
  {
    id: 'after-midnight',
    title: 'после полуночи',
    subtitle: 'electronic · 6 демо-фрагментов',
    color: '#d45639',
    ids: tracks
      .filter((t) => ['after-hours', 'side-b'].includes(t.albumId))
      .map((t) => t.id),
  },
  {
    id: 'soft-rhythm',
    title: 'мягкий ритм',
    subtitle: 'house · 6 демо-фрагментов',
    color: '#e4d995',
    ids: tracks
      .filter((t) => ['soft-focus', 'open-fields'].includes(t.albumId))
      .map((t) => t.id),
  },
];
export function getAlbum(id: string) {
  return albums.find((a) => a.id === id) ?? albums[0];
}
export function getTrack(id: string) {
  return tracks.find((t) => t.id === id) ?? tracks[0];
}
export function time(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}
