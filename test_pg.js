/* ============================================================
   test_pg.js  —  اعتبارسنجی مسیر ذخیره‌سازی PostgreSQL
   با pg-mem (پُستگرسِ خالصِ JS). اجرا: node test_pg.js
   ============================================================ */
const { spawn } = require("child_process");
const path = require("path");
const WC = require("./public/shared.js");

let pass = 0, fail = 0; const fails = [];
function ok(c,m){ if(c)pass++; else { fail++; fails.push(m); console.log("  ✗ "+m); } }
function eq(a,b,m){ ok(JSON.stringify(a)===JSON.stringify(b), `${m} (دریافت ${JSON.stringify(a)}، انتظار ${JSON.stringify(b)})`); }

/* ۱) همان SQL سرور، با شبیه‌سازی ری‌استارت (دو Pool روی یک دیتابیس) */
async function sqlRoundTrip(){
  console.log("\n── ۱) round-trip دقیقِ SQL + شبیه‌سازی ری‌استارت ──");
  const { newDb } = require("pg-mem");
  const db = newDb();
  const { Pool } = db.adapters.createPg();

  // «اجرای اول سرور»: ساخت جدول و ذخیرهٔ وضعیت
  const p1 = new Pool();
  await p1.query("CREATE TABLE IF NOT EXISTS wc_state (id int PRIMARY KEY, data jsonb NOT NULL)");
  const state = { users:[{id:"u1",name:"رضا"}], admin:"u1", cfg:WC.DEFAULT_CFG,
                  results:{ m1:{h:2,a:1,s:["Vinícius Júnior"]} },
                  preds:{ u1:{ m1:{h:2,a:1,s:["Vinícius Júnior"]} } } };
  await p1.query("INSERT INTO wc_state (id,data) VALUES (1,$1::jsonb) ON CONFLICT (id) DO UPDATE SET data=$1::jsonb", [JSON.stringify(state)]);

  // یک تغییر دیگر (upsert روی همان ردیف)
  state.users.push({ id:"u2", name:"زهرا" });
  await p1.query("INSERT INTO wc_state (id,data) VALUES (1,$1::jsonb) ON CONFLICT (id) DO UPDATE SET data=$1::jsonb", [JSON.stringify(state)]);

  // «ری‌استارت سرور»: Pool تازه، خواندن وضعیت (همان دیتابیس)
  const p2 = new Pool();
  const r = await p2.query("SELECT data FROM wc_state WHERE id = 1");
  ok(r.rows.length === 1, "بعد از ری‌استارت ردیف وضعیت موجود است");
  const loaded = typeof r.rows[0].data === "string" ? JSON.parse(r.rows[0].data) : r.rows[0].data;
  eq(loaded.users.length, 2, "هر دو کاربر پس از ری‌استارت باقی ماندند (پایداری)");
  eq(loaded.admin, "u1", "مدیر پس از ری‌استارت حفظ شد");
  eq(loaded.preds.u1.m1.s, ["Vinícius Júnior"], "گلزن پیش‌بینی‌شده درست round-trip شد");
  // امتیاز از روی دادهٔ بازخوانده‌شده درست محاسبه می‌شود
  eq(WC.scoreOne(loaded.preds.u1.m1, loaded.results.m1, loaded.cfg).total, 10, "امتیاز از دادهٔ بازخوانده‌شدهٔ Postgres درست است");
}

/* ۲) سرور واقعی روی شاخهٔ Postgres (pg-mem تزریق‌شده) */
async function serverPgBranch(){
  console.log("\n── ۲) سرور زنده روی شاخهٔ Postgres ──");
  const PORT = 4402, base = "http://localhost:"+PORT;
  const TEST_NOW = String(Date.parse("2026-06-20T12:00:00Z"));
  const srv = spawn("node", ["-r", "./pgmem-preload.js", "server.js"], {
    cwd: __dirname,
    env: { ...process.env, PORT:String(PORT), TEST_NOW, DATABASE_URL:"postgres://mem/db" },
    stdio: "ignore",
  });
  try{
    // صبر تا بالا آمدن
    let up=false; const t0=Date.now();
    while(Date.now()-t0<6000){ try{ const r=await fetch(base+"/api/state"); if(r.ok){up=true;break;} }catch{} await new Promise(r=>setTimeout(r,120)); }
    ok(up, "سرورِ متصل به Postgres بالا آمد");
    if(!up) return;

    const post=async(p,b,token)=>{ const headers={"Content-Type":"application/json"}; if(token) headers["Authorization"]="Bearer "+token; const r=await fetch(base+p,{method:"POST",headers,body:JSON.stringify(b||{})}); return {status:r.status, body:await r.json().catch(()=>({}))}; };
    const getState=async()=>(await fetch(base+"/api/state")).json();

    const nowN = Number(TEST_NOW);
    const open = WC.MATCHES.find(m=>!WC.isLocked(m,nowN));
    const lockedM = WC.MATCHES.find(m=>WC.isLocked(m,nowN));

    const u=[]; for(let i=0;i<5;i++) u.push((await post("/api/register",{username:"P"+i, email:`p${i}@m.com`, password:"secret"+i})).body);
    eq(u.filter(x=>x.id && x.token).length,5,"۵ کاربر روی Postgres ثبت‌نام شدند (با توکن)");
    const adminTok=u[0].token;

    const a1=await post("/api/prediction",{matchId:open.id,h:2,a:1,s:[WC.TEAMS[open.home].p[0]]}, u[1].token);
    eq(a1.status,200,"پیش‌بینی روی بازی باز پذیرفته شد (Postgres)");
    const a2=await post("/api/prediction",{matchId:lockedM.id,h:1,a:0,s:[]}, u[1].token);
    eq(a2.status,403,"پیش‌بینی روی بازی قفل رد شد (Postgres)");

    const rr=await post("/api/result",{matchId:open.id,h:2,a:1,s:[WC.TEAMS[open.home].p[0]]}, adminTok);
    eq(rr.status,200,"مدیر نتیجه را روی Postgres ثبت کرد");

    // ورود مجدد با رمز درست
    const lg=await post("/api/login",{username:"P1", password:"secret1"});
    eq(lg.status,200,"ورود مجدد روی Postgres کار می‌کند");

    const st=await getState();
    const lb=st.leaderboard;
    eq(lb.find(r=>r.id===u[1].id).total, 10, "امتیاز از وضعیتِ Postgres درست محاسبه شد (3+5+2)");
    ok(!(st.users||[]).some(x=>"hash" in x || "email" in x), "state در Postgres هم اطلاعات حساس لو نمی‌دهد");
  } finally { srv.kill(); }
}

(async function(){
  console.log("════════ تست مسیر ذخیره‌سازی PostgreSQL ════════");
  try{ require.resolve("pg-mem"); }
  catch{ console.log("pg-mem نصب نیست؛ این تست رد می‌شود."); process.exit(0); }
  await sqlRoundTrip();
  await serverPgBranch();
  console.log("\n══════════════════════════════════════════");
  console.log(`نتیجه:  ✓ ${pass} قبول    ✗ ${fail} رد`);
  if(fail){ fails.forEach(f=>console.log(" • "+f)); process.exit(1); }
  else console.log("✅ مسیر Postgres کامل تأیید شد.");
})();
