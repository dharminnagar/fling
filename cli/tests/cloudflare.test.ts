import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Config } from "../src/types.js";

const config: Config = {
  apiToken: "test-token",
  accountId: "acc123",
  kvNamespaceId: "kv123",
  domain: "html.dharmin.xyz",
};

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const { kvPut, kvGet, kvDelete } = await import("../src/cloudflare.js");

describe("Cloudflare KV API", () => {
  beforeEach(() => mockFetch.mockReset());

  it("kvPut sends PUT request with correct auth header", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
    await kvPut(config, "foo", "hello");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.cloudflare.com/client/v4/accounts/acc123/storage/kv/namespaces/kv123/values/foo",
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({ Authorization: "Bearer test-token" }),
        body: "hello",
      })
    );
  });

  it("kvGet returns value on success", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, text: async () => "my-html" });
    expect(await kvGet(config, "foo")).toBe("my-html");
  });

  it("kvGet returns null on 404", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
    expect(await kvGet(config, "missing")).toBeNull();
  });

  it("kvDelete sends DELETE request", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
    await kvDelete(config, "foo");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.cloudflare.com/client/v4/accounts/acc123/storage/kv/namespaces/kv123/values/foo",
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("kvPut throws on API error with CF error message", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ errors: [{ message: "Forbidden" }] }),
    });
    await expect(kvPut(config, "foo", "bar")).rejects.toThrow("Cloudflare API error 403: Forbidden");
  });
});
