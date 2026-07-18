// Phase 2 (Admin / Moderator / Super Admin) runtime smoke test.
// Logs in as each role via NextAuth credentials, then checks every admin
// page (server render, not redirected to /login) and admin GET API (200 JSON).
//
// Usage: node scripts/phase2-smoke.mjs [baseUrl]
// Requires the dev server running (default http://localhost:3000).

const BASE = process.argv[2] || "http://localhost:3000";
const PASSWORD = "Demo123!";

const ROLES = {
  super_admin: "admin@dronepilot.local",
  admin: "ops@dronepilot.local",
  moderator: "moderator@dronepilot.local",
};

const PAGES = [
  "/dashboard/admin",
  "/dashboard/admin/applications",
  "/dashboard/admin/bookings",
  "/dashboard/admin/certificates",
  "/dashboard/admin/clients",
  "/dashboard/admin/cms",
  "/dashboard/admin/cms/articles",
  "/dashboard/admin/cms/articles/new",
  "/dashboard/admin/cms/resources",
  "/dashboard/admin/cms/resources/new",
  "/dashboard/admin/disputes",
  "/dashboard/admin/jobs",
  "/dashboard/admin/messages",
  "/dashboard/admin/payments",
  "/dashboard/admin/permissions",
  "/dashboard/admin/pilots",
  "/dashboard/admin/regions",
  "/dashboard/admin/reports",
  "/dashboard/admin/reviews",
  "/dashboard/admin/settings",
  "/dashboard/admin/shop",
  "/dashboard/admin/squadron-voting",
  "/dashboard/admin/subscriptions",
  "/dashboard/admin/support",
  "/dashboard/admin/users",
  "/dashboard/admin/verifications",
  "/dashboard/admin/waitlist",
  "/dashboard/admin/achievements",
];

const APIS = [
  "/api/admin/stats",
  "/api/admin/jobs",
  "/api/admin/applications",
  "/api/admin/bookings",
  "/api/admin/disputes",
  "/api/admin/payments",
  "/api/admin/pilots",
  "/api/admin/clients",
  "/api/admin/users",
  "/api/admin/waitlist",
  "/api/admin/regions",
  "/api/admin/subscriptions",
  "/api/admin/conversations",
  "/api/admin/management-users",
  "/api/admin/permissions",
  "/api/admin/configuration",
  "/api/admin/cms-engine",
  "/api/admin/cms/articles",
  "/api/admin/cms/resources",
  "/api/admin/certificate-engine",
  "/api/admin/certificate-templates",
  "/api/admin/certificates",
  "/api/admin/badge-engine",
  "/api/admin/wing-definitions",
  "/api/admin/wings",
  "/api/admin/shop-engine",
  "/api/admin/shop/products",
  "/api/admin/shop/orders",
  "/api/admin/verifications",
  "/api/admin/squadron-voting",
  "/api/admin/support/chats",
];

function parseSetCookies(res, jar) {
  const cookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  for (const c of cookies) {
    const [pair] = c.split(";");
    const idx = pair.indexOf("=");
    if (idx > 0) {
      const name = pair.slice(0, idx).trim();
      const value = pair.slice(idx + 1).trim();
      jar.set(name, value);
    }
  }
}

function cookieHeader(jar) {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

async function login(email) {
  const jar = new Map();
  // 1. CSRF token
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`, { redirect: "manual" });
  parseSetCookies(csrfRes, jar);
  const { csrfToken } = await csrfRes.json();

  // 2. Credentials callback
  const body = new URLSearchParams({
    csrfToken,
    email,
    password: PASSWORD,
    callbackUrl: `${BASE}/dashboard/admin`,
    json: "true",
  });
  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookieHeader(jar),
    },
    body,
    redirect: "manual",
  });
  parseSetCookies(loginRes, jar);

  const hasSession =
    jar.has("authjs.session-token") ||
    jar.has("__Secure-authjs.session-token");
  return { jar, hasSession, status: loginRes.status };
}

async function checkPage(jar, path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Cookie: cookieHeader(jar) },
    redirect: "manual",
  });
  const loc = res.headers.get("location") || "";
  if (res.status >= 300 && res.status < 400) {
    if (loc.includes("/login")) return { ok: false, code: `${res.status}→login` };
    return { ok: false, code: `${res.status}→${loc.slice(0, 30)}` };
  }
  return { ok: res.status === 200, code: String(res.status) };
}

async function checkApi(jar, path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Cookie: cookieHeader(jar) },
    redirect: "manual",
  });
  let detail = "";
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      const j = await res.json();
      if (j && typeof j === "object" && "error" in j) detail = ` ${JSON.stringify(j.error).slice(0, 40)}`;
    } catch {
      detail = " (bad json)";
    }
  } else if (res.status >= 300 && res.status < 400) {
    detail = ` →${(res.headers.get("location") || "").slice(0, 20)}`;
  }
  return { ok: res.status === 200, code: `${res.status}${detail}` };
}

async function main() {
  const results = {};
  for (const [role, email] of Object.entries(ROLES)) {
    const { jar, hasSession, status } = await login(email);
    results[role] = { hasSession, loginStatus: status, pages: {}, apis: {} };
    if (!hasSession) {
      console.log(`\n!! ${role} (${email}) LOGIN FAILED (status ${status})`);
      continue;
    }
    for (const p of PAGES) results[role].pages[p] = await checkPage(jar, p);
    for (const a of APIS) results[role].apis[a] = await checkApi(jar, a);
  }

  for (const role of Object.keys(ROLES)) {
    const r = results[role];
    console.log(`\n================ ${role.toUpperCase()} ================`);
    if (!r.hasSession) {
      console.log("  LOGIN FAILED");
      continue;
    }
    console.log("  -- PAGES --");
    for (const [p, v] of Object.entries(r.pages)) {
      console.log(`   ${v.ok ? "OK " : "XX "} ${v.code.padEnd(14)} ${p}`);
    }
    console.log("  -- APIS --");
    for (const [a, v] of Object.entries(r.apis)) {
      console.log(`   ${v.ok ? "OK " : "XX "} ${v.code.padEnd(24)} ${a}`);
    }
  }

  console.log("\n================ SUMMARY (failures only) ================");
  for (const role of Object.keys(ROLES)) {
    const r = results[role];
    if (!r.hasSession) {
      console.log(`${role}: LOGIN FAILED`);
      continue;
    }
    const pageFails = Object.entries(r.pages).filter(([, v]) => !v.ok);
    const apiFails = Object.entries(r.apis).filter(([, v]) => !v.ok);
    console.log(`\n${role}: ${pageFails.length} page fail, ${apiFails.length} api fail`);
    for (const [p, v] of pageFails) console.log(`   PAGE ${v.code} ${p}`);
    for (const [a, v] of apiFails) console.log(`   API  ${v.code} ${a}`);
  }
}

main().catch((e) => {
  console.error("SMOKE ERROR", e);
  process.exit(1);
});
