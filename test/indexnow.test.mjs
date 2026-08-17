import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import indexNowHandler, {
  extractCanonicalUrls,
  submitIndexNow,
} from "../netlify/functions/indexnow.mjs";

const sitemapXml = await readFile(new URL("../sitemap.xml", import.meta.url), "utf8");

test("extracts the canonical HTTPS URLs from the sitemap", () => {
  const urls = extractCanonicalUrls(sitemapXml);

  assert.equal(urls.length, 12);
  assert.equal(urls[0], "https://reacnspire.com/");
  assert.ok(urls.every((url) => new URL(url).hostname === "reacnspire.com"));
});

test("submits the sitemap URLs and public key to IndexNow", async () => {
  const calls = [];
  const mockFetch = async (url, options = {}) => {
    calls.push({ url, options });
    return url.endsWith("sitemap.xml")
      ? new Response(sitemapXml, { status: 200 })
      : new Response(null, { status: 202 });
  };

  await submitIndexNow(mockFetch);

  assert.equal(calls.length, 2);
  const payload = JSON.parse(calls[1].options.body);
  assert.equal(payload.host, "reacnspire.com");
  assert.equal(payload.urlList.length, 12);
  assert.equal(
    payload.keyLocation,
    "https://reacnspire.com/9a2c240a75ca8a36bbf406e7001c64b4.txt",
  );
});

test("does not submit preview deployments", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("fetch should not run for a preview deploy");
  };

  try {
    await indexNowHandler.deploySucceeded({ deploy: { context: "deploy-preview" } });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
