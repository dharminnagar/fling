import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Config, PageMeta } from "../../src/types.js";

const config: Config = {
  apiToken: "tok",
  accountId: "acc",
  kvNamespaceId: "kv",
  domain: "html.dharmin.xyz",
};

const mockKvGet = vi.fn();
const mockKvPut = vi.fn();
const mockKvDelete = vi.fn();

vi.mock("../../src/cloudflare.js", () => ({
  kvGet: mockKvGet,
  kvPut: mockKvPut,
  kvDelete: mockKvDelete,
}));

const { listPages } = await import("../../src/commands/list.js");
const { deletePage } = await import("../../src/commands/delete.js");

describe("listPages", () => {
  beforeEach(() => mockKvGet.mockReset());

  it("returns empty array when no index", async () => {
    mockKvGet.mockResolvedValueOnce(null);
    expect(await listPages(config)).toEqual([]);
  });

  it("returns pages with metadata", async () => {
    const meta: PageMeta = { name: "foo", filename: "foo.html", deployedAt: "2026-01-01T00:00:00.000Z" };
    mockKvGet
      .mockResolvedValueOnce(JSON.stringify(["foo"]))  // __index__
      .mockResolvedValueOnce(JSON.stringify(meta));    // __meta__foo
    const pages = await listPages(config);
    expect(pages).toHaveLength(1);
    expect(pages[0]).toEqual(meta);
  });
});

describe("deletePage", () => {
  beforeEach(() => {
    mockKvGet.mockReset();
    mockKvPut.mockReset().mockResolvedValue(undefined);
    mockKvDelete.mockReset().mockResolvedValue(undefined);
  });

  it("throws if page does not exist", async () => {
    mockKvGet.mockResolvedValueOnce(null);
    await expect(deletePage(config, "missing")).rejects.toThrow('"missing" not found');
  });

  it("deletes HTML and meta keys", async () => {
    mockKvGet
      .mockResolvedValueOnce("<html>x</html>")
      .mockResolvedValueOnce(JSON.stringify(["foo", "bar"]));
    await deletePage(config, "foo");
    expect(mockKvDelete).toHaveBeenCalledWith(config, "foo");
    expect(mockKvDelete).toHaveBeenCalledWith(config, "__meta__foo");
  });

  it("removes slug from __index__", async () => {
    mockKvGet
      .mockResolvedValueOnce("<html>x</html>")
      .mockResolvedValueOnce(JSON.stringify(["foo", "bar"]));
    await deletePage(config, "foo");
    const indexCall = mockKvPut.mock.calls.find(([, key]) => key === "__index__");
    expect(JSON.parse(indexCall![2])).toEqual(["bar"]);
  });
});
