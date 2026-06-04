import { getHtml, getIndex, getMeta } from "./kv.js";
import { renderIndex } from "./renderer.js";

export interface Env {
  HTML_STORE: KVNamespace;
}

export async function handleRequest(req: Request, kv: KVNamespace, domain: string): Promise<Response> {
  const hostname = new URL(req.url).hostname;
  const html = (body: string, status = 200) =>
    new Response(body, { status, headers: { "content-type": "text/html;charset=UTF-8" } });

  if (hostname === domain) {
    const slugs = await getIndex(kv);
    const metas = await Promise.all(slugs.map((s) => getMeta(kv, s)));
    const pages = metas.filter((m): m is NonNullable<typeof m> => m !== null);
    return html(renderIndex(pages, domain));
  }

  if (!hostname.endsWith(`.${domain}`)) {
    return html("<h1>400 — Bad Request</h1>", 400);
  }
  const slug = hostname.slice(0, hostname.indexOf(`.${domain}`));
  const content = await getHtml(kv, slug);
  if (content === null) {
    return html(
      `<h1>404 — Not Found</h1><p><a href="https://${domain}">Back to index</a></p>`,
      404
    );
  }
  return html(content);
}

export default {
  fetch(req: Request, env: Env): Promise<Response> {
    return handleRequest(req, env.HTML_STORE, "html.dharmin.xyz");
  },
};
