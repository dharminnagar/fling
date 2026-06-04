import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Config, PageMeta } from "../../src/types.js";

const config: Config = {
  apiToken: "tok",
  accountId: "acc",
  kvNamespaceId: "kv",
  domain: "html.dharmin.xyz",
};

const mockKvPut = vi.fn();
const mockKvGet = vi.fn();

vi.mock("../../src/cloudflare.js", () => ({
  kvPut: mockKvPut,
  kvGet: mockKvGet,
}));

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn().mockResolvedValue("<html><body>Hello</body></html>"),
  stat: vi.fn().mockResolvedValue({ size: 100 }),
}));

const { deployPage } = await import("../../src/commands/deploy.js");

describe("deployPage", () => {
  beforeEach(() => {
    mockKvPut.mockReset().mockResolvedValue(undefined);
    mockKvGet.mockReset().mockResolvedValue(null);
  });

  it("puts HTML content under the slug key", async () => {
    await deployPage(config, "test.html", "my-page", false);
    expect(mockKvPut).toHaveBeenCalledWith(config, "my-page", "<html><body>Hello</body></html>");
  });

  it("puts metadata under __meta__ key with correct shape", async () => {
    await deployPage(config, "test.html", "my-page", false);
    const metaCall = mockKvPut.mock.calls.find(([, key]) => key === "__meta__my-page");
    expect(metaCall).toBeDefined();
    const meta = JSON.parse(metaCall![2]) as PageMeta;
    expect(meta.name).toBe("my-page");
    expect(meta.filename).toBe("test.html");
    expect(meta.deployedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("throws if name already exists and force=false", async () => {
    mockKvGet.mockResolvedValueOnce("<html>existing</html>");
    await expect(deployPage(config, "test.html", "my-page", false)).rejects.toThrow(
      'Name "my-page" already deployed. Use --force to overwrite.'
    );
  });

  it("overwrites when force=true", async () => {
    mockKvGet.mockResolvedValueOnce("<html>existing</html>");
    await expect(deployPage(config, "test.html", "my-page", true)).resolves.not.toThrow();
  });

  it("adds slug to existing __index__", async () => {
    mockKvGet
      .mockResolvedValueOnce(null)                     // existence check
      .mockResolvedValueOnce(JSON.stringify(["bar"])); // existing index
    await deployPage(config, "test.html", "my-page", false);
    const indexCall = mockKvPut.mock.calls.find(([, key]) => key === "__index__");
    const index = JSON.parse(indexCall![2]) as string[];
    expect(index).toContain("my-page");
    expect(index).toContain("bar");
  });

  it("returns the deployed URL", async () => {
    const url = await deployPage(config, "test.html", "my-page", false);
    expect(url).toBe("https://my-page.html.dharmin.xyz");
  });

  it("throws on invalid name", async () => {
    await expect(deployPage(config, "test.html", "My Page", false)).rejects.toThrow();
  });
});
