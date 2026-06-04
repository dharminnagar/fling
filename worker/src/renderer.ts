import type { PageMeta } from "./kv.js";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderIndex(pages: PageMeta[], domain: string): string {
  const rows =
    pages.length === 0
      ? `<p style="color:#888">No pages deployed yet. Use <code>htmlup deploy</code> to get started.</p>`
      : pages
          .map(
            (p) => `
    <div style="padding:12px 0;border-bottom:1px solid #eee">
      <a href="https://${escapeHtml(p.name)}.${escapeHtml(domain)}" style="font-size:1.05em;font-weight:600;color:#0066cc">${escapeHtml(p.name)}</a>
      <span style="color:#666;margin-left:12px;font-size:0.9em">${escapeHtml(p.filename)}</span>
      <span style="color:#aaa;margin-left:12px;font-size:0.85em">${escapeHtml(p.deployedAt.slice(0, 10))}</span>
    </div>`
          )
          .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(domain)}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 680px; margin: 60px auto; padding: 0 20px; color: #111; }
    h1 { font-size: 1.4em; margin-bottom: 4px; }
    .sub { color: #666; margin-top: 0; font-size: 0.95em; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>${escapeHtml(domain)}</h1>
  <p class="sub">${pages.length} page${pages.length !== 1 ? "s" : ""} deployed</p>
  ${rows}
</body>
</html>`;
}
