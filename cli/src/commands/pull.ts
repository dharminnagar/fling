import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { kvGet } from "../cloudflare.js";
import type { Config } from "../types.js";

export async function pullPage(config: Config, slug: string, outputPath?: string): Promise<void> {
  const html = await kvGet(config, slug);
  if (!html) throw new Error(`No page found for slug '${slug}'`);
  const dest = resolve(outputPath ?? `${slug}.html`);
  await writeFile(dest, html, "utf-8");
  console.log(`Saved to ${dest}`);
}
