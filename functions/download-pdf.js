/**
 * Pages Function: /download-pdf
 *
 * Validates a token from query param and serves the PDF.
 * Token must exist in KV namespace PDF_TOKENS.
 *
 * Route: GET /download-pdf?token=xxx
 */

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

  // Read PDF base64 from KV
  const pdfBase64 = await env.PDF_TOKENS.get("pdf_base64");
  if (!pdfBase64) {
    return new Response("PDF not found", { status: 404 });
  }

  // Decode base64 to binary
  const pdfBuffer = Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0));

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
