import { albums, tracks } from './catalog.ts';

export type Library = {
  likedTracks: string[];
  likedAlbums: string[];
  followedArtists: string[];
};
export const initialLibrary: Library = {
  likedTracks: [tracks[0].id, tracks[6].id],
  likedAlbums: [albums[0].id],
  followedArtists: [albums[0].artistId],
};
const unique = (items: unknown, valid: Set<string>) =>
  Array.isArray(items)
    ? [
        ...new Set(
          items.filter(
            (x): x is string => typeof x === 'string' && valid.has(x),
          ),
        ),
      ]
    : [];
export function readLibrary(raw: string | null): Library {
  if (!raw)
    return {
      ...initialLibrary,
      likedTracks: [...initialLibrary.likedTracks],
      likedAlbums: [...initialLibrary.likedAlbums],
      followedArtists: [...initialLibrary.followedArtists],
    };
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object' || Array.isArray(value))
      return readLibrary(null);
    const data = value as Record<string, unknown>;
    return {
      likedTracks: unique(data.likedTracks, new Set(tracks.map((t) => t.id))),
      likedAlbums: unique(data.likedAlbums, new Set(albums.map((a) => a.id))),
      followedArtists: unique(
        data.followedArtists,
        new Set(albums.map((a) => a.artistId)),
      ),
    };
  } catch {
    return readLibrary(null);
  }
}
export function toggle<T>(items: T[], item: T): T[] {
  return items.includes(item)
    ? items.filter((x) => x !== item)
    : [...items, item];
}
export function resolveQueue(ids: string[]): string[] {
  const known = new Set(tracks.map((t) => t.id));
  return ids.filter((id) => known.has(id));
}
export function randomQueue(
  ids: string[],
  currentId: string,
  random = Math.random,
): string[] {
  const next = [...new Set(resolveQueue(ids))];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  if (next.length > 1 && next[0] === currentId) next.push(next.shift()!);
  return next;
}

export type LocalProfile = {
  nickname: string;
  avatar: 'sun' | 'mint' | 'night';
};
export function readProfile(raw: string | null): LocalProfile {
  const fallback: LocalProfile = { nickname: 'слушатель', avatar: 'sun' };
  try {
    const value: unknown = JSON.parse(raw ?? 'null');
    if (!value || typeof value !== 'object' || Array.isArray(value))
      return fallback;
    const data = value as Record<string, unknown>;
    return {
      nickname:
        typeof data.nickname === 'string' && data.nickname.trim()
          ? data.nickname.trim().slice(0, 32)
          : fallback.nickname,
      avatar:
        data.avatar === 'mint' || data.avatar === 'night' ? data.avatar : 'sun',
    };
  } catch {
    return fallback;
  }
}
export function stepIndex(
  index: number,
  length: number,
  direction: -1 | 1,
  repeat: boolean,
) {
  if (length <= 0) return 0;
  const next = index + direction;
  return repeat
    ? (next + length) % length
    : Math.max(0, Math.min(length - 1, next));
}
export function moveQueue(ids: string[], index: number, target: number) {
  if (
    index < 0 ||
    index >= ids.length ||
    target < 0 ||
    target >= ids.length ||
    index === target
  )
    return ids;
  const next = [...ids];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}
