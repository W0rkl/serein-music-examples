import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  readLibrary,
  toggle,
  stepIndex,
  moveQueue,
  resolveQueue,
} from '../src/lib/model.ts';
import { tracks } from '../src/lib/catalog.ts';

test('corrupt or unknown saved library content cannot enter the catalog', () => {
  assert.ok(readLibrary('{broken').likedTracks.length > 0);
  const result = readLibrary(
    JSON.stringify({
      likedTracks: [tracks[0].id, tracks[0].id, 'missing', 9],
      likedAlbums: [],
      followedArtists: null,
    }),
  );
  assert.deepEqual(result.likedTracks, [tracks[0].id]);
  assert.deepEqual(result.likedAlbums, []);
  assert.deepEqual(result.followedArtists, []);
});
test('saving an album does not save all its tracks', () => {
  const before = readLibrary(
    JSON.stringify({ likedTracks: [], likedAlbums: [], followedArtists: [] }),
  );
  const next = {
    ...before,
    likedAlbums: toggle(before.likedAlbums, 'slow-shapes'),
  };
  assert.deepEqual(next.likedTracks, []);
  assert.equal(next.likedAlbums.length, 1);
});
test('queue can end, repeat, reorder upcoming content and reject unknown IDs', () => {
  assert.equal(stepIndex(2, 3, 1, false), 2);
  assert.equal(stepIndex(2, 3, 1, true), 0);
  assert.equal(stepIndex(0, 3, -1, false), 0);
  assert.deepEqual(moveQueue(['a', 'b', 'c'], 2, 1), ['a', 'c', 'b']);
  assert.deepEqual(moveQueue(['a', 'b'], -1, 0), ['a', 'b']);
  assert.deepEqual(resolveQueue([tracks[0].id, 'not-a-track']), [tracks[0].id]);
});
