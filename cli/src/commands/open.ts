import { spawnSync } from "node:child_process";
import { validateName } from "../validate.js";
import type { Config } from "../types.js";

export function openPage(config: Config, name: string): void {
  const validation = validateName(name);
  if (!validation.ok) throw new Error(validation.error);
  const url = `https://${name}.${config.domain}`;
  spawnSync("open", [url]);
  console.log(url);
}
