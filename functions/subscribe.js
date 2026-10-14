/**
 * Pages Function: /functions/subscribe
 *
 * Receives POST requests with JSON body:
 *   { "email": "...", "due_date": "...", "consent": true }
 *
 * Forwards to MailerLite API to create a subscriber in the
 * "Weight Gain PDF" group.
 *
 * Environment variables (set in Cloudflare Pages dashboard):
 *   MAILERLITE_API_TOKEN  — encrypted secret
 *   MAILERLITE_GROUP_ID   — plaintext
 */

const MAILERLITE_BASE = "https://connect.mailerlite.com/api";

/**
 * CORS headers for cross-origin requests.
 */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/**
 * JSON response helper.
 */
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

/**
 * Validate email format.
 */
function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  if (email.length > 254) return false;
  // Simple but effective regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validate due_date format (YYYY-MM-DD).
 */
function isValidDate(date) {
  if (!date) return true; // optional
  if (typeof date !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const d = new Date(date);
  return !isNaN(d.getTime());
}

/**
 * Handle OPTIONS (CORS preflight).
 */
function handleOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * Handle POST — create subscriber in MailerLite.
 */
async function handlePost(request, env) {
  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON body" }, 400);
  }

  const { email, due_date, consent } = body;

  // Validate
  if (!isValidEmail(email)) {
    return json({ ok: false, error: "Please enter a valid email address." }, 400);
  }

  if (consent !== true) {
    return json({ ok: false, error: "Please agree to receive emails." }, 400);
  }

  if (!isValidDate(due_date)) {
    return json({ ok: false, error: "Invalid date format. Use YYYY-MM-DD." }, 400);
  }

  // Check env vars
  const token = env.MAILERLITE_API_TOKEN;
  const groupId = env.MAILERLITE_GROUP_ID;

  if (!token || !groupId) {
    console.error("Missing environment variables");
    return json({ ok: false, error: "Server configuration error." }, 500);
  }

  // Build MailerLite payload
  const payload = {
    email: email.trim().toLowerCase(),
    groups: [groupId],
    status: "unconfirmed", // double opt-in will be handled by MailerLite
    resubscribe: true,
  };

  // Add due_date as custom field if provided
  if (due_date) {
    payload.fields = { due_date };
  }

  // Call MailerLite API
  try {
    const resp = await fetch(`${MAILERLITE_BASE}/subscribers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();

    if (resp.ok) {
      // Generate a unique download token and store in KV
      const downloadToken = crypto.randomUUID();
      await env.PDF_TOKENS.put(downloadToken, email.trim().toLowerCase(), {
        expirationTtl: 2592000, // 30 days
      });

      return json({
        ok: true,
        message: "Check your inbox — the PDF is on its way.",
        download_token: downloadToken,
      });
    }

    // Handle MailerLite errors
    const message = data?.message || "Something went wrong. Please try again.";
    const errors = data?.errors;
    let detail = message;
    if (errors && typeof errors === "object") {
      const firstKey = Object.keys(errors)[0];
      if (firstKey && errors[firstKey]?.[0]) {
        detail = errors[firstKey][0];
      }
    }

    // If already subscribed, treat as success
    if (resp.status === 422 && message.includes("already")) {
      return json({
        ok: true,
        message: "You're already subscribed! Check your inbox for the PDF.",
      });
    }

    return json({ ok: false, error: detail }, resp.status || 400);
  } catch (err) {
    console.error("MailerLite API error:", err);
    return json({ ok: false, error: "Network error. Please try again." }, 500);
  }
}

/**
 * Main handler.
 */
export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return handleOptions();
  }

  if (request.method === "POST") {
    return handlePost(request, env);
  }

  return json({ ok: false, error: "Method not allowed." }, 405);
}
