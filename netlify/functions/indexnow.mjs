const SITE_HOST = "reacnspire.com";
const SITEMAP_URL = `https://${SITE_HOST}/sitemap.xml`;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const INDEXNOW_KEY = "9a2c240a75ca8a36bbf406e7001c64b4";
const KEY_LOCATION = `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`;

export function extractCanonicalUrls(sitemapXml) {
  const urls = [...sitemapXml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)]
    .map((match) => match[1].trim())
    .filter((value, index, values) => values.indexOf(value) === index)
    .filter((value) => {
      try {
        const url = new URL(value);
        return url.protocol === "https:" && url.hostname === SITE_HOST;
      } catch {
        return false;
      }
    });

  if (urls.length === 0) {
    throw new Error("The live sitemap did not contain any canonical HTTPS URLs.");
  }

  if (urls.length > 10_000) {
    throw new Error("The live sitemap exceeds IndexNow's 10,000 URL batch limit.");
  }

  return urls;
}

export async function submitIndexNow(fetchImpl = fetch) {
  const sitemapResponse = await fetchImpl(SITEMAP_URL, {
    headers: { "user-agent": "Kendra-REAC-IndexNow/1.0" },
  });

  if (!sitemapResponse.ok) {
    throw new Error(`Unable to fetch sitemap: HTTP ${sitemapResponse.status}`);
  }

  const urlList = extractCanonicalUrls(await sitemapResponse.text());
  const indexNowResponse = await fetchImpl(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: SITE_HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList,
    }),
  });

  if (![200, 202].includes(indexNowResponse.status)) {
    const responseBody = await indexNowResponse.text();
    throw new Error(
      `IndexNow rejected the submission: HTTP ${indexNowResponse.status} ${responseBody}`.trim(),
    );
  }

  console.log(
    `Submitted ${urlList.length} URLs to IndexNow after a successful production deploy (HTTP ${indexNowResponse.status}).`,
  );
}

export default {
  async deploySucceeded(event) {
    if (event?.deploy?.context !== "production") {
      console.log(`Skipping IndexNow for ${event?.deploy?.context ?? "unknown"} deploy.`);
      return;
    }

    await submitIndexNow();
  },
};
