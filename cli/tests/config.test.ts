import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { promises as fs } from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

const tmpDir = path.join(os.tmpdir(), `fling-test-${process.pid}`);

vi.mock("node:os", async (importOriginal) => {
  const actual = await importOriginal<typeof os>();
  return { ...actual, homedir: () => tmpDir };
});

const { readConfig, writeConfig } = await import("../src/config.js");

describe("config", () => {
  beforeEach(async () => {
    await fs.mkdir(path.join(tmpDir, ".config", "fling"), { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("readConfig returns null when file missing", async () => {
    expect(await readConfig()).toBeNull();
  });

  it("writeConfig + readConfig round-trips", async () => {
    const config = {
      apiToken: "tok",
      accountId: "acc",
      kvNamespaceId: "kv",
      domain: "html.dharmin.xyz",
    };
    await writeConfig(config);
    expect(await readConfig()).toEqual(config);
  });
});
