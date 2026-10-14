/**
 * Pages Function: /download-pdf
 *
 * Validates a token from query param and serves the PDF.
 * Token must exist in KV namespace PDF_TOKENS.
 *
 * Route: GET /download-pdf?token=xxx
 */

const PDF_PATH = "assets/pregnancy-weight-gain-system.pdf";

/**
 * Serve the PDF from the build assets.
 * In Cloudflare Pages, assets are available via env.ASSETS.
 */
async function servePdf() {
  // Read PDF from the Pages assets
  const pdfUrl = new URL(PDF_PATH, import.meta.url);
  const resp = await fetch(pdfUrl);
  if (!resp.ok) {
    return new Response("PDF not found", { status: 404 });
  }
  const pdfBuffer = await resp.arrayBuffer();
  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="pregnancy-weight-gain-system.pdf"',
      "X-Robots-Tag": "noindex",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response("Missing token", { status: 401 });
  }

  // Validate token against KV
  const valid = await env.PDF_TOKENS.get(token);
  if (!valid) {
    return new Response("Invalid or expired token", { status: 401 });
  }

  return servePdf();
}
