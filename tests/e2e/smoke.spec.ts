import { expect, test } from "@playwright/test";

test("home renders", async ({ request }) => {
  const res = await request.get("/");
  expect(res.ok()).toBeTruthy();
  const html = await res.text();
  expect(html).toMatch(/the9thedition/i);
});

test("admin route redirects unauthenticated users to login", async ({ request }) => {
  const res = await request.get("/admin", { maxRedirects: 0 });
  expect([301, 302, 303, 307, 308]).toContain(res.status());
  const loc = res.headers()["location"] ?? "";
  expect(loc).toMatch(/\/login/);
});
