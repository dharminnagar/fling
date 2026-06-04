import { readFile, stat } from "node:fs/promises";
import * as path from "node:path";
import { kvGet, kvPut } from "../cloudflare.js";
import { validateName } from "../validate.js";
import type { Config, PageMeta } from "../types.js";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

export async function deployPage(
  config: Config,
  filePath: string,
  name: string,
  force: boolean
): Promise<string> {
  const validation = validateName(name);
  if (!validation.ok) throw new Error(validation.error);

  const filestat = await stat(filePath);
  if (filestat.size > MAX_FILE_BYTES) {
    console.warn(`Warning: file is ${(filestat.size / 1024 / 1024).toFixed(1)}MB — unusually large for HTML.`);
  }

  const html = await readFile(filePath, "utf-8");

  const existing = await kvGet(config, name);
  if (existing !== null && !force) {
    throw new Error(`Name "${name}" already deployed. Use --force to overwrite.`);
  }

  await kvPut(config, name, html);

  const meta: PageMeta = {
    name,
    filename: path.basename(filePath),
    deployedAt: new Date().toISOString(),
  };
  await kvPut(config, `__meta__${name}`, JSON.stringify(meta));

  const rawIndex = await kvGet(config, "__index__");
  const index: string[] = rawIndex ? (JSON.parse(rawIndex) as string[]) : [];
  if (!index.includes(name)) index.push(name);
  await kvPut(config, "__index__", JSON.stringify(index));

  return `https://${name}.${config.domain}`;
}
