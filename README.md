# fling

Deploy a single HTML file to your Cloudflare subdomain in one command.

```bash
fling deploy index.html my-page
# → https://my-page-html.dharmin.xyz
```

## Setup

### Prerequisites

- Cloudflare account with a domain
- Cloudflare Worker + KV namespace ([see worker/](./worker/))
- Node.js 18+

### Install

```bash
npm install -g @dharmin/fling
```

### Configure

```bash
fling init
```

Prompts for your Cloudflare API token, account ID, KV namespace ID, and domain.

Config saved to `~/.config/fling/config.json`.

## Commands

```bash
fling deploy <file> <name> [--force]   # deploy HTML file
fling list                              # list all deployed pages
fling open <name>                       # open page in browser
fling delete <name>                     # delete a page
fling init                              # configure credentials
```

## How it works

- HTML stored in Cloudflare KV
- Single Worker serves pages at `<name>-html.yourdomain.xyz`
- Index page at `html.yourdomain.xyz` lists all deployed pages
- Uses `*.yourdomain.xyz` wildcard DNS (proxied) — no per-page DNS setup needed

## License

MIT
