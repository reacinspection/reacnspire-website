import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import test from 'node:test';
const root = new URL('../', import.meta.url);
for (const page of ['adiestramiento-nspire-puerto-rico','spanish-nspire-training','nspire-pre-inspection','es']) {
  test(`${page}: crawlable, canonical, valid schema, local links`, () => {
    const html = readFileSync(new URL(`${page}/index.html`, root), 'utf8');
    assert.equal((html.match(/<h1[ >]/g)||[]).length, 1);
    assert.ok(!html.includes('noindex'));
    const title = html.match(/<title>(.*?)<\/title>/)?.[1];
    assert.ok(title, 'Page title must be present');
    if (['spanish-nspire-training','nspire-pre-inspection'].includes(page)) {
      assert.ok(title.length <= 60, 'Keep service titles concise');
      assert.ok(title.includes('Kendra REAC'), 'Preserve brand in service titles');
    }
    assert.ok(html.includes(`https://reacnspire.com/${page}/`));
    for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
    for (const match of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
      const path = match[1].slice(1);
      assert.ok(existsSync(new URL(path.endsWith('/') ? path+'index.html' : path, root)), `Missing ${path}`);
    }
  });
}
