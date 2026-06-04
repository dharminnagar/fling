import { Command } from "commander";
import { readConfig } from "./config.js";
import { runInit } from "./commands/init.js";
import { deployPage } from "./commands/deploy.js";
import { listPages } from "./commands/list.js";
import { deletePage } from "./commands/delete.js";
import { openPage } from "./commands/open.js";

const program = new Command();

program.name("htmlup").description("Deploy HTML files to Cloudflare").version("1.0.0");

program
  .command("init")
  .description("Set up Cloudflare credentials")
  .action(async () => {
    await runInit();
  });

program
  .command("deploy <file> <name>")
  .description("Deploy an HTML file to <name>.html.dharmin.xyz")
  .option("-f, --force", "Overwrite if name already exists")
  .action(async (file: string, name: string, opts: { force?: boolean }) => {
    const config = await readConfig();
    if (!config) return console.error("No config found. Run: htmlup init");
    try {
      const url = await deployPage(config, file, name, opts.force ?? false);
      console.log(`✓ ${url}`);
    } catch (e) {
      console.error((e as Error).message);
      process.exit(1);
    }
  });

program
  .command("list")
  .description("List all deployed pages")
  .action(async () => {
    const config = await readConfig();
    if (!config) return console.error("No config found. Run: htmlup init");
    try {
      const pages = await listPages(config);
      if (pages.length === 0) return console.log("No pages deployed yet.");
      for (const p of pages) {
        const url = `https://${p.name}.${config.domain}`;
        console.log(`${p.name.padEnd(24)} ${url.padEnd(55)} ${p.deployedAt.slice(0, 10)}`);
      }
    } catch (e) {
      console.error((e as Error).message);
      process.exit(1);
    }
  });

program
  .command("delete <name>")
  .description("Delete a deployed page")
  .action(async (name: string) => {
    const config = await readConfig();
    if (!config) return console.error("No config found. Run: htmlup init");
    try {
      await deletePage(config, name);
      console.log(`Deleted ${name}`);
    } catch (e) {
      console.error((e as Error).message);
      process.exit(1);
    }
  });

program
  .command("open <name>")
  .description("Open a deployed page in your browser")
  .action(async (name: string) => {
    const config = await readConfig();
    if (!config) return console.error("No config found. Run: htmlup init");
    openPage(config, name);
  });

program.parse();
