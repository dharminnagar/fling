export interface Config {
  apiToken: string;
  accountId: string;
  kvNamespaceId: string;
  domain: string;
}

export interface PageMeta {
  name: string;
  filename: string;
  deployedAt: string; // ISO 8601
}
