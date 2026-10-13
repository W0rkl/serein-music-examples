import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const built = await readFile(resolve(project, 'dist/index.html'), 'utf8');
const jsPath = built.match(
  /<script[^>]+src="\.\/([^"<>]+)"[^>]*><\/script>/,
)?.[1];
const cssPath = built.match(/<link[^>]+href="\.\/([^"<>]+\.css)"[^>]*>/)?.[1];
if (!jsPath || !cssPath)
  throw new Error('production assets missing: run npm run build first');

const [javascript, stylesheet, favicon] = await Promise.all([
  readFile(resolve(project, 'dist', jsPath), 'utf8'),
  readFile(resolve(project, 'dist', cssPath), 'utf8'),
  readFile(resolve(project, 'public/favicon.svg')),
]);
const exported = built
  .replace(
    /<script[^>]+src="\.\/[^"<>]+"[^>]*><\/script>/,
    () =>
      `<script type="module">${javascript.replace(/<\/script/gi, '<\\/script')}</script>`,
  )
  .replace(
    /<link[^>]+href="\.\/[^"<>]+\.css"[^>]*>/,
    () => `<style>${stylesheet.replace(/<\/style/gi, '<\\/style')}</style>`,
  )
  .replace(
    'href="./favicon.svg"',
    `href="data:image/svg+xml;base64,${favicon.toString('base64')}"`,
  );

await mkdir(resolve(project, 'preview'), { recursive: true });
await writeFile(resolve(project, 'preview/standalone.html'), exported);
console.log('preview/standalone.html: self-contained export written');
