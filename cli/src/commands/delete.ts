import { kvDelete, kvGet, kvPut } from "../cloudflare.js";
import type { Config } from "../types.js";

export async function deletePage(config: Config, name: string): Promise<void> {
  const existing = await kvGet(config, name);
  if (existing === null) throw new Error(`"${name}" not found`);

  await kvDelete(config, name);
  await kvDelete(config, `__meta__${name}`);

  const rawIndex = await kvGet(config, "__index__");
  const index: string[] = rawIndex ? (JSON.parse(rawIndex) as string[]) : [];
  await kvPut(config, "__index__", JSON.stringify(index.filter((s) => s !== name)));
}
