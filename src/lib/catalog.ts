export type Album = {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  genre: string;
  color: string;
  art: string;
  image: string;
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
    image:
      'https://cdn.21st.dev/assets/mirror/5d/5d6e8915544702407b6392e9773d77bade1c555a3e6a299510bc1cd8204a62b8.jpg',
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
    image:
      'https://cdn.21st.dev/assets/mirror/19/19bb6becb68b7c874c3791ffb234936e931771441065665663c0fb106224311f.jpg',
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
    image:
      'https://cdn.21st.dev/assets/mirror/aa/aa803f534e92f6e1bffc791cda7e30748f775a39498f12a9828eb92deb5c6184.jpg',
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
    image:
      'https://cdn.21st.dev/assets/mirror/71/71440bc0d5ed35f57b44bf08642e908cae075251ea59cda4d590ec2852354659.jpg',
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
    image:
      'https://cdn.21st.dev/assets/mirror/f2/f25c373ae65890570d2cdbf057e3d999a5e7313a5aa34a9a7329f670d56b32da.jpg',
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
    image:
      'https://cdn.21st.dev/assets/mirror/96/961fb12099ef654125e178d3ee23bef8dc43cbbe07f327ca79042f8609c7d867.jpg',
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
