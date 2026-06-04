import { describe, it, expect } from "vitest";

function makeKV(initial: Record<string, string> = {}): KVNamespace {
  const store = new Map(Object.entries(initial));
  return {
    get: (key: string) => Promise.resolve(store.get(key) ?? null),
    put: (key: string, value: string) => { store.set(key, value); return Promise.resolve(); },
    delete: (key: string) => { store.delete(key); return Promise.resolve(); },
    getWithMetadata: () => Promise.resolve({ value: null, metadata: null }),
    list: () => Promise.resolve({ keys: [], list_complete: true, cursor: "" }),
  } as unknown as KVNamespace;
}

const { handleRequest } = await import("../src/index.js");

const DOMAIN = "html.dharmin.xyz";

describe("Worker handleRequest", () => {
  it("returns 404 for unknown subdomain", async () => {
    const kv = makeKV();
    const res = await handleRequest(new Request("https://missing-html.dharmin.xyz/"), kv, DOMAIN);
    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toContain("text/html");
  });

  it("serves HTML for known slug", async () => {
    const kv = makeKV({ foo: "<h1>Hello</h1>" });
    const res = await handleRequest(new Request("https://foo-html.dharmin.xyz/"), kv, DOMAIN);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("<h1>Hello</h1>");
    expect(res.headers.get("content-type")).toContain("text/html");
  });

  it("renders index for root domain", async () => {
    const meta = JSON.stringify({ name: "foo", filename: "foo.html", deployedAt: "2026-01-01T00:00:00.000Z" });
    const kv = makeKV({ "__index__": JSON.stringify(["foo"]), "__meta__foo": meta });
    const res = await handleRequest(new Request("https://html.dharmin.xyz/"), kv, DOMAIN);
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("foo");
    expect(body).toContain("foo-html.dharmin.xyz");
    expect(body).toContain("2026-01-01");
  });

  it("renders empty state on index when no pages deployed", async () => {
    const kv = makeKV();
    const res = await handleRequest(new Request("https://html.dharmin.xyz/"), kv, DOMAIN);
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("No pages deployed");
  });
});
