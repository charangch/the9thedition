import { expect, test } from "@playwright/test";

test("health endpoint returns ok", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.ok()).toBeTruthy();
  const json = (await res.json()) as { ok?: boolean };
  expect(json.ok).toBe(true);
});

test("login page includes noindex robots meta", async ({ request }) => {
  const res = await request.get("/login");
  expect(res.ok()).toBeTruthy();
  const html = await res.text();
  expect(html).toMatch(/name=["']robots["'][^>]*content=["'][^"']*noindex/i);
});

test("report-bug page HTML renders", async ({ request }) => {
  const res = await request.get("/report-bug");
  expect(res.ok()).toBeTruthy();
  const html = await res.text();
  expect(html).toMatch(/report a bug/i);
});

test("newsletter API rate limits after threshold", async ({ request }) => {
  const first = await request.post("/api/newsletter/subscription", {
    data: {
      email: `rate-test-${Date.now()}@example.com`,
      status: "subscribed",
      name: "Rate Test",
    },
  });
  if (first.status() === 503) {
    test.skip();
    return;
  }

  const payload = {
    email: `rate-test-loop@example.com`,
    status: "subscribed" as const,
    name: "Rate Loop",
  };

  let saw429 = false;
  for (let i = 0; i < 28; i++) {
    const res = await request.post("/api/newsletter/subscription", { data: payload });
    if (res.status() === 429) {
      saw429 = true;
      break;
    }
  }
  expect(saw429).toBe(true);
});

test.describe("admin auth flows", () => {
  test("login page includes admin login shell", async ({ request }) => {
    const res = await request.get("/login");
    expect(res.ok()).toBeTruthy();
    const html = await res.text();
    expect(html).toMatch(/Admin login|LoginForm/i);
  });

  test("reset-password page renders", async ({ request }) => {
    const res = await request.get("/reset-password");
    expect(res.ok()).toBeTruthy();
    const html = await res.text();
    expect(html.length).toBeGreaterThan(200);
  });
});
