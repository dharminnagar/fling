import type { Config } from "./types.js";

const BASE = "https://api.cloudflare.com/client/v4";

function kvUrl(config: Config, key: string): string {
  return `${BASE}/accounts/${config.accountId}/storage/kv/namespaces/${config.kvNamespaceId}/values/${encodeURIComponent(key)}`;
}

function authHeaders(config: Config): Record<string, string> {
  return { Authorization: `Bearer ${config.apiToken}` };
}

async function throwIfError(res: Response): Promise<void> {
  if (!res.ok) {
    let msg = "Unknown error";
    try {
      const body = await res.json() as { errors?: Array<{ message: string }> };
      msg = body.errors?.[0]?.message ?? msg;
    } catch {
      // non-JSON body (gateway errors, etc.)
    }
    throw new Error(`Cloudflare API error ${res.status}: ${msg}`);
  }
}

export async function kvPut(config: Config, key: string, value: string): Promise<void> {
  const res = await fetch(kvUrl(config, key), {
    method: "PUT",
    headers: authHeaders(config),
    body: value,
  });
  await throwIfError(res);
}

export async function kvGet(config: Config, key: string): Promise<string | null> {
  const res = await fetch(kvUrl(config, key), { headers: authHeaders(config) });
  if (res.status === 404) return null;
  await throwIfError(res);
  return res.text();
}

export async function kvDelete(config: Config, key: string): Promise<void> {
  const res = await fetch(kvUrl(config, key), {
    method: "DELETE",
    headers: authHeaders(config),
  });
  await throwIfError(res);
}
