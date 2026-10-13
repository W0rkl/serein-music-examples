import { createServer } from 'vite';
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import assert from 'node:assert/strict';

// A server-rendering check only. It does not emulate a browser or claim
// viewport, focus, audio output or client hydration verification.
const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
});
try {
  const { App } = await server.ssrLoadModule('/src/App.tsx');
  const results = [];
  for (const device of ['desktop', 'phone']) {
    for (const [hash, expected] of [
      ['home', 'твоя'],
      ['search', 'поиск'],
      ['collection', 'коллекция'],
      ['album/slow-shapes', 'slow shapes'],
      ['artist/serein', 'serein'],
      ['playlist/slow-morning', 'медленное утро'],
    ]) {
      globalThis.location = { search: `?device=${device}`, hash: `#${hash}` };
      globalThis.innerWidth = device === 'phone' ? 390 : 1440;
      const html = renderToString(createElement(App));
      assert.ok(
        html.includes(expected),
        `${device}/${hash}: expected page text`,
      );
      assert.ok(
        html.includes('мини-плеер'),
        `${device}/${hash}: persistent player`,
      );
      assert.ok(
        html.includes(device === 'phone' ? 'spring-dock' : 'sidebar-nav'),
        `${device}/${hash}: correct navigation`,
      );
      results.push(`${device}/${hash}`);
    }
  }
  console.log('server render passed:', results.join(', '));
} finally {
  await server.close();
}
