/* ============================================================
   server.js  —  سرور بدون وابستگیِ زمان‌اجرا (به‌جز pg برای حالت Postgres)
   احراز هویت: نام‌کاربری + رمز عبور (هشِ scrypt) + توکن نشست.
   اجرا:  node server.js   (پیش‌فرض پورت 3000)
   ============================================================ */
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const WC = require("./public/shared.js");

const PORT = Number(process.env.PORT || 3000);
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, "data.json");
const PUBLIC = path.join(__dirname, "public");

function now(){ return process.env.TEST_NOW ? Number(process.env.TEST_NOW) : Date.now(); }

/* ---------- persistence (Postgres اگر DATABASE_URL باشد، وگرنه فایل) ---------- */
const USE_PG = !!process.env.DATABASE_URL;
let pool = null;
const DEFAULT_DB = () => ({ users: [], sessions: {}, admin: null, cfg: { ...WC.DEFAULT_CFG }, results: {}, preds: {} });
let DB = DEFAULT_DB();

function normalizeDB(){
  if(!DB || typeof DB !== "object") DB = DEFAULT_DB();
  if(!DB.cfg) DB.cfg = { ...WC.DEFAULT_CFG };
  if(!DB.preds) DB.preds = {};
  if(!DB.results) DB.results = {};
  if(!DB.users) DB.users = [];
  if(!DB.sessions) DB.sessions = {};
  if(DB.admin === undefined) DB.admin = null;
  // مهاجرت: حساب‌های قدیمیِ بدون رمز (فقط-اسم) حذف می‌شوند تا امنیت برقرار شود
  DB.users = DB.users.filter(u => u && u.id && u.hash && u.salt);
  const valid = new Set(DB.users.map(u => u.id));
  const np = {}; for(const k in DB.preds) if(valid.has(k)) np[k] = DB.preds[k]; DB.preds = np;
  const ns = {}; for(const t in DB.sessions) if(valid.has(DB.sessions[t])) ns[t] = DB.sessions[t]; DB.sessions = ns;
  if(DB.admin && !valid.has(DB.admin)) DB.admin = null;
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

/* ---------- auth helpers ---------- */
const uid = () => "u" + crypto.randomBytes(6).toString("hex");
const makeToken = () => crypto.randomBytes(32).toString("hex");
function hashPw(password, salt){ return crypto.scryptSync(String(password), salt, 32).toString("hex"); }
function verifyPw(password, salt, hash){
  try{
    const h = Buffer.from(hashPw(password, salt), "hex");
    const k = Buffer.from(hash, "hex");
    return h.length === k.length && crypto.timingSafeEqual(h, k);
  }catch{ return false; }
}
// کد بازیابی: ۱۶ کاراکتر، نمایش به‌صورت XXXX-XXXX-XXXX-XXXX، ذخیره فقط به‌صورت هش
const normalizeCode = s => String(s||"").replace(/[^a-z0-9]/gi, "").toLowerCase();
function makeRecovery(){
  const raw = crypto.randomBytes(8).toString("hex");      // ۱۶ کاراکتر hex
  const pretty = raw.toUpperCase().match(/.{1,4}/g).join("-");
  return { pretty, normalized: raw.toLowerCase() };
}
function setRecovery(u){
  const r = makeRecovery();
  u.recSalt = crypto.randomBytes(16).toString("hex");
  u.recHash = hashPw(r.normalized, u.recSalt);
  return r.pretty;
}
function verifyRecovery(u, code){
  if(!u || !u.recHash || !u.recSalt) return false;
  return verifyPw(normalizeCode(code), u.recSalt, u.recHash);
}
function setPassword(u, pw){ u.salt = crypto.randomBytes(16).toString("hex"); u.hash = hashPw(pw, u.salt); }
const genTempPw = () => crypto.randomBytes(4).toString("hex");   // ۸ کاراکتر
function isUser(id){ return DB.users.some(u => u.id === id); }
function userById(id){ return DB.users.find(u => u.id === id); }
function userByName(name){ return DB.users.find(u => WC.norm(u.name) === WC.norm(name)); }
function tokenFrom(req, body){
  const h = req.headers["authorization"] || "";
  if(h.startsWith("Bearer ")) return h.slice(7).trim();
  if(body && body.token) return String(body.token);
  return null;
}
function authUid(req, body){
  const t = tokenFrom(req, body);
  if(!t) return null;
  const id = DB.sessions[t];
  return (id && isUser(id)) ? id : null;
}
const pubUser = u => ({ id: u.id, name: u.name });


/* ---------- http helpers ---------- */
function send(res, code, obj){
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(obj));
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

  // وضعیت بازی؛ با توکن معتبر، پیش‌بینی‌های خودِ کاربر هم برگردانده می‌شود
  if(url === "/api/state" && method === "GET"){
    const meId = authUid(req, null);
    const me = meId ? pubUser(DB.users.find(u => u.id === meId)) : null;
    return send(res, 200, {
      now: now(),
      users: DB.users.map(pubUser),
      admin: DB.admin,
      cfg: DB.cfg,
      results: DB.results,
      leaderboard: WC.leaderboard(DB.users, DB.preds, DB.results, DB.cfg),
      me,
      myPreds: meId ? (DB.preds[meId] || {}) : {},
    });
  }

  if(url === "/api/register" && method === "POST"){
    const { username, password, email } = await readBody(req);
    const name = String(username||"").trim().slice(0,30);
    const pw = String(password||"");
    if(name.length < 2) return send(res, 400, { error: "نام‌کاربری حداقل ۲ حرف" });
    if(pw.length < 4)   return send(res, 400, { error: "رمز عبور حداقل ۴ کاراکتر" });
    if(userByName(name)) return send(res, 409, { error: "این نام‌کاربری قبلاً گرفته شده" });
    const u = { id: uid(), name, email: String(email||"").trim().slice(0,120) };
    setPassword(u, pw);
    const recoveryCode = setRecovery(u);
    DB.users.push(u);
    DB.preds[u.id] = {};
    if(!DB.admin) DB.admin = u.id;
    const token = makeToken(); DB.sessions[token] = u.id;
    save();
    return send(res, 200, { token, id: u.id, name: u.name, admin: DB.admin, recoveryCode });
  }

  if(url === "/api/login" && method === "POST"){
    const { username, password } = await readBody(req);
    const u = userByName(String(username||"").trim());
    if(!u || !verifyPw(String(password||""), u.salt, u.hash))
      return send(res, 401, { error: "نام‌کاربری یا رمز عبور اشتباه است" });
    const token = makeToken(); DB.sessions[token] = u.id;
    save();
    return send(res, 200, { token, id: u.id, name: u.name, admin: DB.admin });
  }

  if(url === "/api/logout" && method === "POST"){
    const t = tokenFrom(req, await readBody(req));
    if(t && DB.sessions[t]){ delete DB.sessions[t]; save(); }
    return send(res, 200, { ok: true });
  }

  // بازیابی رمز با «کد بازیابی» (بدون نیاز به ایمیل)
  if(url === "/api/recover" && method === "POST"){
    const { username, recoveryCode, newPassword } = await readBody(req);
    const u = userByName(String(username||"").trim());
    const pw = String(newPassword||"");
    if(!u) return send(res, 401, { error: "نام‌کاربری یا کد بازیابی اشتباه است" });
    if(!u.recHash) return send(res, 400, { error: "این حساب کد بازیابی ندارد؛ از مدیر بخواه رمزت را ریست کند" });
    if(!verifyRecovery(u, recoveryCode)) return send(res, 401, { error: "نام‌کاربری یا کد بازیابی اشتباه است" });
    if(pw.length < 4) return send(res, 400, { error: "رمز جدید حداقل ۴ کاراکتر" });
    setPassword(u, pw);
    const token = makeToken(); DB.sessions[token] = u.id;
    save();
    return send(res, 200, { token, id: u.id, name: u.name, admin: DB.admin });
  }

  // تغییر رمز توسط کاربرِ واردشده (با رمز فعلی)
  if(url === "/api/change-password" && method === "POST"){
    const body = await readBody(req);
    const meId = authUid(req, body);
    if(!meId) return send(res, 401, { error: "لطفاً وارد شوید" });
    const u = userById(meId);
    if(!verifyPw(String(body.oldPassword||""), u.salt, u.hash)) return send(res, 401, { error: "رمز فعلی اشتباه است" });
    const np = String(body.newPassword||"");
    if(np.length < 4) return send(res, 400, { error: "رمز جدید حداقل ۴ کاراکتر" });
    setPassword(u, np);
    save();
    return send(res, 200, { ok: true });
  }

  // ریست رمز توسط مدیر → یک رمز موقت تولید و برمی‌گرداند تا مدیر به کاربر بدهد
  if(url === "/api/admin/reset-password" && method === "POST"){
    const body = await readBody(req);
    const meId = authUid(req, body);
    if(meId !== DB.admin) return send(res, 403, { error: "فقط مدیر" });
    const u = userById(body.target);
    if(!u) return send(res, 404, { error: "کاربر هدف نامعتبر" });
    const temp = genTempPw();
    setPassword(u, temp);
    // نشست‌های فعلیِ آن کاربر باطل می‌شوند تا با رمز موقت دوباره وارد شود
    for(const t in DB.sessions){ if(DB.sessions[t] === u.id) delete DB.sessions[t]; }
    save();
    return send(res, 200, { ok: true, tempPassword: temp, name: u.name });
  }

  if(url === "/api/prediction" && method === "POST"){
    const body = await readBody(req);
    const meId = authUid(req, body);
    if(!meId) return send(res, 401, { error: "لطفاً وارد شوید" });
    const m = WC.MATCH_BY_ID[body.matchId];
    if(!m) return send(res, 404, { error: "بازی پیدا نشد" });
    if(WC.isLocked(m, now())) return send(res, 403, { error: "این بازی قفل شده است" });
    const H = clampGoals(body.h), A = clampGoals(body.a);
    if(H==null || A==null) return send(res, 400, { error: "نتیجهٔ نامعتبر" });
    if(!DB.preds[meId]) DB.preds[meId] = {};
    DB.preds[meId][body.matchId] = { h: H, a: A, s: cleanScorers(body.s).slice(0,2) };
    save();
    return send(res, 200, { ok: true });
  }

  if(url === "/api/result" && method === "POST"){
    const body = await readBody(req);
    const meId = authUid(req, body);
    if(meId !== DB.admin) return send(res, 403, { error: "فقط مدیر می‌تواند نتیجه ثبت کند" });
    const m = WC.MATCH_BY_ID[body.matchId];
    if(!m) return send(res, 404, { error: "بازی پیدا نشد" });
    const H = clampGoals(body.h), A = clampGoals(body.a);
    if(H==null || A==null) return send(res, 400, { error: "نتیجهٔ نامعتبر" });
    DB.results[body.matchId] = { h: H, a: A, s: cleanScorers(body.s) };
    save();
    return send(res, 200, { ok: true });
  }

  if(url === "/api/result/delete" && method === "POST"){
    const body = await readBody(req);
    const meId = authUid(req, body);
    if(meId !== DB.admin) return send(res, 403, { error: "فقط مدیر" });
    delete DB.results[body.matchId]; save();
    return send(res, 200, { ok: true });
  }

  if(url === "/api/config" && method === "POST"){
    const body = await readBody(req);
    const meId = authUid(req, body);
    if(meId !== DB.admin) return send(res, 403, { error: "فقط مدیر" });
    const c = body.cfg || {};
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
    const body = await readBody(req);
    const meId = authUid(req, body);
    if(meId !== DB.admin) return send(res, 403, { error: "فقط مدیر" });
    if(!isUser(body.target)) return send(res, 404, { error: "کاربر هدف نامعتبر" });
    DB.admin = body.target; save();
    return send(res, 200, { ok: true, admin: DB.admin });
  }

  return send(res, 404, { error: "مسیر نامعتبر" });
}

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
