import { promises as fs } from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { Config } from "./types.js";

export const CONFIG_PATH = path.join(os.homedir(), ".config", "htmlup", "config.json");

export async function readConfig(): Promise<Config | null> {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf-8");
    return JSON.parse(raw) as Config;
  } catch {
    return null;
  }
}

export async function writeConfig(config: Config): Promise<void> {
  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}
