# fling

Deploy a single HTML file to your Cloudflare subdomain in one command.

```bash
npx @dharminnagar/fling deploy index.html my-page
# → https://my-page-html.dharmin.xyz
```

## Install

```bash
npm install -g @dharminnagar/fling
```

Requires Node.js 18+.

## Setup

Run once to configure your Cloudflare credentials:

```bash
fling init
```

You'll be prompted for:

| Field | Where to find it |
|---|---|
| API token | [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) — needs KV read/write |
| Account ID | Cloudflare dashboard → right sidebar |
| KV namespace ID | Workers & Pages → KV → your namespace |
| Domain | Your Cloudflare-proxied domain (e.g. `example.com`) |

Config is saved to `~/.config/fling/config.json`.

## Commands

### `fling deploy <file> <name>`

Upload an HTML file. Accessible at `https://<name>-html.<domain>`.

```bash
fling deploy index.html my-page
fling deploy dashboard.html dash --force   # overwrite existing
```

### `fling list`

List all deployed pages with their URLs and deploy dates.

```bash
fling list
```

### `fling pull <name>`

Download a deployed page back to a local file.

```bash
fling pull my-page                        # saves my-page.html in current dir
fling pull my-page --output ./out.html   # custom output path
```

### `fling open <name>`

Open a deployed page in your default browser.

```bash
fling open my-page
```

### `fling delete <name>`

Delete a deployed page.

```bash
fling delete my-page
```

## How it works

HTML files are stored in a Cloudflare KV namespace and served by a Cloudflare Worker on a wildcard subdomain (`*-html.<domain>`). No per-page DNS setup required — one Worker and one KV namespace handle everything.

## License

MIT
