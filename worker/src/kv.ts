export interface PageMeta {
  name: string;
  filename: string;
  deployedAt: string;
}

export async function getHtml(kv: KVNamespace, slug: string): Promise<string | null> {
  return kv.get(slug);
}

export async function getIndex(kv: KVNamespace): Promise<string[]> {
  const raw = await kv.get("__index__");
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export async function getMeta(kv: KVNamespace, slug: string): Promise<PageMeta | null> {
  const raw = await kv.get(`__meta__${slug}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PageMeta;
  } catch {
    return null;
  }
}
