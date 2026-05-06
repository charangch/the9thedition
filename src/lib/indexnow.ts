import { getSiteUrl } from "@/lib/site-url";

type IndexNowPayload = {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
};

export async function submitUrlsToIndexNow(urls: string[]): Promise<{ ok: boolean; status: number; body: string }> {
  const key = process.env.INDEXNOW_KEY?.trim();
  if (!key || urls.length === 0) {
    return { ok: false, status: 400, body: "missing_key_or_urls" };
  }

  const base = getSiteUrl();
  const host = new URL(base).host;
  const keyLocation = `${base}/${key}.txt`;

  const payload: IndexNowPayload = {
    host,
    key,
    keyLocation,
    urlList: urls.map((u) => u.trim()).filter(Boolean),
  };

  const res = await fetch("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });

  const body = await res.text().catch(() => "");
  return { ok: res.ok, status: res.status, body: body.slice(0, 500) };
}
