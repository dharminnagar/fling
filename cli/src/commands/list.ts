import { kvGet } from "../cloudflare.js";
import type { Config, PageMeta } from "../types.js";

export async function listPages(config: Config): Promise<PageMeta[]> {
  const rawIndex = await kvGet(config, "__index__");
  if (!rawIndex) return [];
  const slugs = JSON.parse(rawIndex) as string[];
  const metas = await Promise.all(
    slugs.map(async (slug) => {
      const raw = await kvGet(config, `__meta__${slug}`);
      return raw ? (JSON.parse(raw) as PageMeta) : null;
    })
  );
  return metas.filter((m): m is PageMeta => m !== null);
}
