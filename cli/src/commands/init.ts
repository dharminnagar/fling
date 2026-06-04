import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { writeConfig } from "../config.js";
import type { Config } from "../types.js";

export async function runInit(): Promise<void> {
  const rl = readline.createInterface({ input, output });

  console.log("Setting up htmlup...\n");
  console.log("Create a Cloudflare API token with Workers KV Edit + DNS Edit permissions.");
  console.log("dash.cloudflare.com → Profile → API Tokens → Create Token\n");

  const apiToken = (await rl.question("API Token: ")).trim();
  const accountId = (await rl.question("Account ID (right sidebar on dash.cloudflare.com): ")).trim();
  const kvNamespaceId = (await rl.question("KV Namespace ID (Workers & Pages → KV): ")).trim();
  const domainInput = (await rl.question("Base domain [html.dharmin.xyz]: ")).trim();
  const domain = domainInput || "html.dharmin.xyz";

  rl.close();

  const config: Config = { apiToken, accountId, kvNamespaceId, domain };
  await writeConfig(config);

  console.log(`\nConfig saved to ~/.config/htmlup/config.json`);
  console.log(`Test with: htmlup list`);
}
