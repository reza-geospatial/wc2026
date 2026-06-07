/* ============================================================
   server.js  —  سرور بدون وابستگی (فقط ماژول‌های داخلی Node)
   اجرا:  node server.js   (پیش‌فرض پورت 3000)
   داده‌ها در فایل data.json ذخیره می‌شوند.
   ============================================================ */
const http = require("http");
const fs = require("fs");
const path = require("path");
const WC = require("./public/shared.js");

const PORT = Number(process.env.PORT || 3000);
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, "data.json");
const PUBLIC = path.join(__dirname, "public");

// «اکنون» — در حالت تست با متغیر محیطی TEST_NOW قابل تنظیم است (در تولید استفاده نمی‌شود)
function now(){ return process.env.TEST_NOW ? Number(process.env.TEST_NOW) : Date.now(); }

/* ---------- persistence (Postgres اگر DATABASE_URL باشد، وگرنه فایل) ---------- */
const USE_PG = !!process.env.DATABASE_URL;
let pool = null;
const DEFAULT_DB = () => ({ users: [], admin: null, cfg: { ...WC.DEFAULT_CFG }, results: {}, preds: {} });
let DB = DEFAULT_DB();

function normalizeDB(){
  if(!DB || typeof DB !== "object") DB = DEFAULT_DB();
  if(!DB.cfg) DB.cfg = { ...WC.DEFAULT_CFG };
  if(!DB.preds) DB.preds = {};
  if(!DB.results) DB.results = {};
  if(!DB.users) DB.users = [];
  if(DB.admin === undefined) DB.admin = null;
}

async function load(){
  if(USE_PG){
    let Pool;
    try { ({ Pool } = require("pg")); }
    catch(e){ console.error("بستهٔ pg نصب نیست. روی هاست `npm install` اجرا شود."); throw e; }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSL === "disable" ? false : { rejectUnauthorized: false },
      max: 3,
    });
    await pool.query("CREATE TABLE IF NOT EXISTS wc_state (id int PRIMARY KEY, data jsonb NOT NULL)");
    const r = await pool.query("SELECT data FROM wc_state WHERE id = 1");
    if(r.rows.length){ DB = r.rows[0].data; normalizeDB(); }
    else { DB = DEFAULT_DB(); await pool.query("INSERT INTO wc_state (id, data) VALUES (1, $1::jsonb)", [JSON.stringify(DB)]); }
    console.log("ذخیره‌سازی: PostgreSQL (پایدار)");
  } else {
    try { DB = JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); }
    catch { DB = DEFAULT_DB(); }
    normalizeDB();
    console.log("ذخیره‌سازی: فایل " + DATA_FILE);
  }
}

let saving = false, pending = false;
function save(){
  if(saving){ pending = true; return; }
  saving = true;
  const done = () => { saving = false; if(pending){ pending = false; save(); } };
  if(USE_PG){
    pool.query("INSERT INTO wc_state (id, data) VALUES (1, $1::jsonb) ON CONFLICT (id) DO UPDATE SET data = $1::jsonb", [JSON.stringify(DB)])
      .then(done).catch(e => { console.error("خطای ذخیره در Postgres:", e.message); done(); });
  } else {
    const tmp = DATA_FILE + ".tmp";
    fs.writeFile(tmp, JSON.stringify(DB), err => {
      if(!err){ try { fs.renameSync(tmp, DATA_FILE); } catch(e){} }
      done();
    });
  }
}

/* ---------- helpers ---------- */
const uid = () => "u" + Math.random().toString(36).slice(2,9) + Date.now().toString(36).slice(-3);
function send(res, code, obj){
  const body = JSON.stringify(obj);
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(body);
}
function readBody(req){
  return new Promise((resolve) => {
    let d = "";
    req.on("data", c => { d += c; if(d.length > 1e6) req.destroy(); });
    req.on("end", () => { try { resolve(d ? JSON.parse(d) : {}); } catch { resolve({}); } });
  });
}
function clampGoals(n){ n = Math.floor(Number(n)); if(!isFinite(n)||n<0) return null; if(n>30) n=30; return n; }
function cleanScorers(arr){
  if(!Array.isArray(arr)) return [];
  return arr.map(s => String(s||"").trim()).filter(Boolean).slice(0,8);
}
function isUser(id){ return DB.users.some(u => u.id === id); }

/* ---------- static ---------- */
const MIME = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8",
  ".css":"text/css; charset=utf-8", ".json":"application/json; charset=utf-8", ".svg":"image/svg+xml",
  ".ico":"image/x-icon", ".png":"image/png" };
function serveStatic(req, res){
  let p = decodeURIComponent(req.url.split("?")[0]);
  if(p === "/") p = "/index.html";
  const fp = path.join(PUBLIC, path.normalize(p).replace(/^(\.\.[/\\])+/, ""));
  if(!fp.startsWith(PUBLIC)) return send(res, 403, { error: "forbidden" });
  fs.readFile(fp, (err, buf) => {
    if(err) return send(res, 404, { error: "not found" });
    res.writeHead(200, { "Content-Type": MIME[path.extname(fp)] || "application/octet-stream" });
    res.end(buf);
  });
}

/* ---------- API ---------- */
async function api(req, res, url){
  const method = req.method;

  // وضعیت کامل بازی برای کلاینت
  if(url === "/api/state" && method === "GET"){
    return send(res, 200, {
      now: now(), users: DB.users, admin: DB.admin, cfg: DB.cfg,
      results: DB.results, preds: DB.preds
    });
  }

  if(url === "/api/register" && method === "POST"){
    const { name } = await readBody(req);
    const nm = String(name||"").trim().slice(0,40);
    if(!nm) return send(res, 400, { error: "نام لازم است" });
    let u = DB.users.find(x => WC.norm(x.name) === WC.norm(nm));
    if(!u){
      u = { id: uid(), name: nm };
      DB.users.push(u);
      if(!DB.preds[u.id]) DB.preds[u.id] = {};
      if(!DB.admin) DB.admin = u.id;   // اولین کاربر = مدیر
      save();
    }
    return send(res, 200, { id: u.id, name: u.name, admin: DB.admin });
  }

  if(url === "/api/prediction" && method === "POST"){
    const { userId, matchId, h, a, s } = await readBody(req);
    if(!isUser(userId)) return send(res, 401, { error: "کاربر نامعتبر" });
    const m = WC.MATCH_BY_ID[matchId];
    if(!m) return send(res, 404, { error: "بازی پیدا نشد" });
    // *** قفل سمت سرور: بعد از سوت شروع، پیش‌بینی پذیرفته نمی‌شود ***
    if(WC.isLocked(m, now())) return send(res, 403, { error: "این بازی قفل شده است (شروع شده/تمام شده)" });
    const H = clampGoals(h), A = clampGoals(a);
    if(H==null || A==null) return send(res, 400, { error: "نتیجهٔ نامعتبر" });
    if(!DB.preds[userId]) DB.preds[userId] = {};
    DB.preds[userId][matchId] = { h: H, a: A, s: cleanScorers(s).slice(0,2) };
    save();
    return send(res, 200, { ok: true });
  }

  if(url === "/api/result" && method === "POST"){
    const { userId, matchId, h, a, s } = await readBody(req);
    if(userId !== DB.admin) return send(res, 403, { error: "فقط مدیر می‌تواند نتیجه ثبت کند" });
    const m = WC.MATCH_BY_ID[matchId];
    if(!m) return send(res, 404, { error: "بازی پیدا نشد" });
    const H = clampGoals(h), A = clampGoals(a);
    if(H==null || A==null) return send(res, 400, { error: "نتیجهٔ نامعتبر" });
    DB.results[matchId] = { h: H, a: A, s: cleanScorers(s) };
    save();
    return send(res, 200, { ok: true });
  }

  if(url === "/api/result/delete" && method === "POST"){
    const { userId, matchId } = await readBody(req);
    if(userId !== DB.admin) return send(res, 403, { error: "فقط مدیر" });
    delete DB.results[matchId]; save();
    return send(res, 200, { ok: true });
  }

  if(url === "/api/config" && method === "POST"){
    const { userId, cfg } = await readBody(req);
    if(userId !== DB.admin) return send(res, 403, { error: "فقط مدیر" });
    const c = cfg || {};
    DB.cfg = {
      pOutcome: Math.max(0, Number(c.pOutcome)||0),
      pOneTeam: Math.max(0, Number(c.pOneTeam)||0),
      pExact:   Math.max(0, Number(c.pExact)||0),
      pScorer:  Math.max(0, Number(c.pScorer)||0),
    };
    save();
    return send(res, 200, { ok: true, cfg: DB.cfg });
  }

  if(url === "/api/admin/transfer" && method === "POST"){
    const { userId, target } = await readBody(req);
    if(userId !== DB.admin) return send(res, 403, { error: "فقط مدیر" });
    if(!isUser(target)) return send(res, 404, { error: "کاربر هدف نامعتبر" });
    DB.admin = target; save();
    return send(res, 200, { ok: true, admin: DB.admin });
  }

  return send(res, 404, { error: "مسیر نامعتبر" });
}

/* ---------- router ---------- */
const server = http.createServer((req, res) => {
  const url = req.url.split("?")[0];
  if(url.startsWith("/api/")) return api(req, res, url).catch(e => send(res, 500, { error: String(e) }));
  return serveStatic(req, res);
});

load().then(() => {
  if(require.main === module){
    server.listen(PORT, () => console.log(`WC2026 → http://localhost:${PORT}`));
  }
}).catch(err => { console.error("بارگذاری داده‌ها ناموفق بود:", err.message); process.exit(1); });

module.exports = { server, _db: () => DB };
