/* ============================================================
   test.js  —  تست کامل: واحد + شبیه‌سازی ده‌ها کاربر روی سرور واقعی
   اجرا:  node test.js
   ============================================================ */
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const WC = require("./public/shared.js");

let pass = 0, fail = 0;
const fails = [];
function ok(cond, msg){ if(cond){ pass++; } else { fail++; fails.push(msg); console.log("  ✗ " + msg); } }
function eq(a, b, msg){ ok(JSON.stringify(a)===JSON.stringify(b), `${msg}  (دریافت ${JSON.stringify(a)} ، انتظار ${JSON.stringify(b)})`); }
function section(t){ console.log("\n── " + t + " ──"); }

const CFG = WC.DEFAULT_CFG; // {pOutcome:3,pOneTeam:2,pExact:5,pScorer:2}

/* ===================== ۱) تست موتور امتیازدهی ===================== */
function testScoring(){
  section("۱) موتور امتیازدهی (scoreOne)");
  const S = (p,r)=>WC.scoreOne(p,r,CFG).total;

  eq(S({h:2,a:1,s:["Vinícius Júnior"]},{h:2,a:1,s:["Vinícius Júnior","Raphinha"]}), 10, "نتیجهٔ دقیق + یک گلزن = 3+5+2");
  eq(S({h:0,a:0},{h:0,a:0}), 8, "تساوی دقیق ۰-۰ = 3+5");
  eq(S({h:1,a:0},{h:2,a:1}), 3, "فقط جهت برد درست = 3");
  eq(S({h:2,a:2},{h:1,a:1}), 3, "تساوی درست ولی عددها غلط = 3");
  eq(S({h:1,a:2},{h:1,a:0}), 2, "جهت غلط ولی گل یک تیم درست = 2");
  eq(S({h:3,a:1,s:["A","B"]},{h:3,a:2,s:["A"]}), 7, "برد درست + یک تیم درست + یک گلزن = 3+2+2");
  eq(S({h:0,a:0},{h:3,a:1}), 0, "همه‌چیز غلط = 0");

  // جزئیات تفکیکی
  const d = WC.scoreOne({h:2,a:1,s:["Messi","Messi"]},{h:2,a:1,s:["Messi"]},CFG);
  eq(d, {outcome:3,team:0,exact:5,scorer:2,total:10}, "نام گلزن تکراری دوبار حساب نمی‌شود (۲ نه ۴)");

  eq(WC.scoreOne(null,{h:1,a:0},CFG), null, "بدون پیش‌بینی = null");
  eq(WC.scoreOne({h:1,a:0},null,CFG), null, "بدون نتیجه = null");

  // حساسیت نداشتن گلزن به بزرگی حروف/فاصله
  eq(S({h:1,a:0,s:["  harry  KANE "]},{h:1,a:0,s:["Harry Kane"]}), 10, "تطبیق گلزن بدون حساسیت به حروف/فاصله");

  // سقف امتیاز یک بازی
  eq(S({h:2,a:1,s:["A","B"]},{h:2,a:1,s:["A","B"]}), 12, "سقف امتیاز یک بازی = 12");
}

/* ===================== ۲) تست قفل زمانی ===================== */
function testLock(){
  section("۲) قفل زمانی (isLocked)");
  const m1 = WC.MATCH_BY_ID["m1"];   // 2026-06-11T19:00:00Z
  const k = new Date(m1.dt).getTime();
  ok(WC.isLocked(m1, k-1)===false, "یک میلی‌ثانیه قبل از شروع → باز");
  ok(WC.isLocked(m1, k)===true,    "دقیقاً لحظهٔ شروع → قفل");
  ok(WC.isLocked(m1, k+1)===true,  "بعد از شروع → قفل");
  // در یک لحظهٔ میانهٔ تورنمنت، بازی‌های گذشته قفل و آینده باز
  const mid = Date.parse("2026-06-20T12:00:00Z");
  const lockedCount = WC.MATCHES.filter(m=>WC.isLocked(m,mid)).length;
  const openCount = WC.MATCHES.filter(m=>!WC.isLocked(m,mid)).length;
  ok(lockedCount>0 && openCount>0, `در میانهٔ تورنمنت ${lockedCount} قفل / ${openCount} باز`);
  eq(lockedCount+openCount, 72, "مجموع بازی‌ها = ۷۲");
}

/* ===================== ۳) صحت داده‌ها ===================== */
function testData(){
  section("۳) صحت داده‌ها");
  eq(WC.MATCHES.length, 72, "تعداد بازی‌های مرحلهٔ گروهی = ۷۲");
  eq(Object.keys(WC.GROUPS).length, 12, "تعداد گروه‌ها = ۱۲");
  eq(Object.keys(WC.TEAMS).length, 48, "تعداد تیم‌ها = ۴۸");
  // هر تیم دقیقاً ۳ بازی دارد
  const cnt={}; WC.MATCHES.forEach(m=>{ cnt[m.home]=(cnt[m.home]||0)+1; cnt[m.away]=(cnt[m.away]||0)+1; });
  const bad = Object.keys(WC.TEAMS).filter(t=>cnt[t]!==3);
  eq(bad, [], "هر تیم دقیقاً ۳ بازی دارد");
  // هر بازیِ هر تیم داخل گروه خودش است
  let groupOk=true;
  WC.MATCHES.forEach(m=>{ const g=WC.GROUPS[m.group]; if(!g.includes(m.home)||!g.includes(m.away)) groupOk=false; });
  ok(groupOk, "هر دو تیمِ هر بازی متعلق به گروه اعلام‌شده هستند");
  // شناسه‌های یکتا
  eq(new Set(WC.MATCHES.map(m=>m.id)).size, 72, "شناسهٔ بازی‌ها یکتاست");
}

/* ===================== ۴) تست جدول امتیازات ===================== */
function testLeaderboard(){
  section("۴) جدول امتیازات (مرتب‌سازی و جمع)");
  const users=[{id:"a",name:"A"},{id:"b",name:"B"},{id:"c",name:"C"}];
  const preds={
    a:{ m1:{h:2,a:1,s:["x"]} },      // res m1 2-1 → 3+5=8
    b:{ m1:{h:1,a:0} },              // جهت درست → 3
    c:{ m1:{h:0,a:3} },              // غلط → 0
  };
  const results={ m1:{h:2,a:1,s:["y"]} };
  const lb=WC.leaderboard(users,preds,results,CFG);
  eq(lb.map(r=>r.id), ["a","b","c"], "ترتیب نزولی امتیاز درست است");
  eq(lb[0].total, 8, "امتیاز نفر اول = 8");
  eq(lb[1].total, 3, "امتیاز نفر دوم = 3");
  eq(lb[2].total, 0, "امتیاز نفر سوم = 0");
  eq(lb[0].exact, 1, "تعداد نتیجهٔ دقیق نفر اول = 1");
}

/* ===================== ۵) شبیه‌سازی ده‌ها کاربر روی سرور واقعی ===================== */
async function waitServer(base, ms=5000){
  const t0=Date.now();
  while(Date.now()-t0<ms){
    try{ const r=await fetch(base+"/api/state"); if(r.ok) return true; }catch{}
    await new Promise(r=>setTimeout(r,120));
  }
  return false;
}

async function testE2E(){
  section("۵) شبیه‌سازی end-to-end با ۳۰ کاربر روی سرور واقعی");
  const PORT = 4399;
  const base = "http://localhost:"+PORT;
  const DATA = path.join(__dirname, "data.test.json");
  try{ fs.unlinkSync(DATA); }catch{}
  // ساعت آزمایشی: میانهٔ تورنمنت تا هم بازیِ قفل داشته باشیم هم باز
  const TEST_NOW = String(Date.parse("2026-06-20T12:00:00Z"));

  const srv = spawn("node", ["server.js"], {
    cwd: __dirname,
    env: { ...process.env, PORT:String(PORT), TEST_NOW, DATA_FILE:DATA },
    stdio: "ignore"
  });

  try{
    const up = await waitServer(base);
    ok(up, "سرور بالا آمد");
    if(!up) return;

    const post=async(p,b)=>{ const r=await fetch(base+p,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)}); return { status:r.status, body:await r.json().catch(()=>({})) }; };
    const getState=async()=>{ const r=await fetch(base+"/api/state"); return r.json(); };

    const nowN = Number(TEST_NOW);
    const lockedMatches = WC.MATCHES.filter(m=>WC.isLocked(m,nowN));
    const openMatches   = WC.MATCHES.filter(m=>!WC.isLocked(m,nowN));
    ok(openMatches.length>0 && lockedMatches.length>0, `داریم ${openMatches.length} بازی باز و ${lockedMatches.length} بازی قفل`);

    // --- ثبت‌نام ۳۰ کاربر ---
    const N=30, users=[];
    for(let i=0;i<N;i++){ const r=await post("/api/register",{name:"کاربر "+(i+1)}); users.push(r.body); }
    eq(users.filter(u=>u.id).length, N, `${N} کاربر ثبت‌نام شدند`);
    const adminId = users[0].id;
    ok(users.every(u=>u.admin===adminId), "همهٔ پاسخ‌ها «اولین کاربر = مدیر» را تأیید می‌کنند");

    // ثبت‌نام تکراری همان نام → همان شناسه
    const dup=await post("/api/register",{name:"کاربر 1"});
    eq(dup.body.id, adminId, "ثبت‌نام دوبارهٔ نام تکراری، شناسهٔ قبلی را برمی‌گرداند");

    // --- هر کاربر برای همهٔ ۷۲ بازی پیش‌بینی می‌فرستد ---
    let accepted=0, rejectedLocked=0, otherErr=0;
    // یک کاربر مشخص با پیش‌بینی‌های معلوم برای راستی‌آزماییِ امتیاز
    const probe = users[1].id;
    const probePreds = {};
    for(const u of users){
      for(const m of WC.MATCHES){
        const h=Math.floor(Math.random()*4), a=Math.floor(Math.random()*4);
        const scorers = Math.random()<0.5 ? [WC.TEAMS[m.home].p[0]] : [];
        const r=await post("/api/prediction",{userId:u.id,matchId:m.id,h,a,s:scorers});
        if(r.status===200){ accepted++; if(u.id===probe && !WC.isLocked(m,nowN)) probePreds[m.id]={h,a,s:scorers}; }
        else if(r.status===403){ rejectedLocked++; }
        else otherErr++;
      }
    }
    eq(otherErr, 0, "هیچ خطای غیرمنتظره‌ای در ثبت پیش‌بینی نبود");
    eq(accepted, N*openMatches.length, `پیش‌بینی‌های پذیرفته‌شده = ${N}×${openMatches.length}`);
    eq(rejectedLocked, N*lockedMatches.length, `پیش‌بینی روی بازی‌های قفل رد شد = ${N}×${lockedMatches.length}`);

    // --- تأیید اینکه بازی قفل واقعاً در حافظه ذخیره نشده ---
    let st = await getState();
    const lockedId = lockedMatches[0].id;
    const anyStoredLocked = Object.values(st.preds).some(p=>p && p[lockedId]);
    ok(!anyStoredLocked, "هیچ پیش‌بینی‌ای برای بازی قفل‌شده ذخیره نشده است");

    // --- کاربر غیرمدیر نمی‌تواند نتیجه ثبت کند ---
    const badRes = await post("/api/result",{userId:users[5].id,matchId:"m1",h:1,a:0,s:[]});
    eq(badRes.status, 403, "کاربر عادی اجازهٔ ثبت نتیجه ندارد");

    // --- کاربر نامعتبر ---
    const badUser = await post("/api/prediction",{userId:"hacker",matchId:openMatches[0].id,h:1,a:1,s:[]});
    eq(badUser.status, 401, "کاربر نامعتبر رد می‌شود");

    // --- مدیر نتیجهٔ همهٔ بازی‌ها را ثبت می‌کند ---
    let resErr=0;
    const results={};
    for(const m of WC.MATCHES){
      const h=Math.floor(Math.random()*4), a=Math.floor(Math.random()*4);
      const s = Math.random()<0.6 ? [WC.TEAMS[m.home].p[0]] : [];
      results[m.id]={h,a,s};
      const r=await post("/api/result",{userId:adminId,matchId:m.id,h,a,s});
      if(r.status!==200) resErr++;
    }
    eq(resErr, 0, "مدیر همهٔ ۷۲ نتیجه را بدون خطا ثبت کرد");

    // --- جدول امتیازات و راستی‌آزمایی ---
    st = await getState();
    const lb = WC.leaderboard(st.users, st.preds, st.results, st.cfg);
    eq(lb.length, N, "جدول شامل همهٔ کاربران است");
    let sorted=true; for(let i=1;i<lb.length;i++) if(lb[i-1].total<lb[i].total) sorted=false;
    ok(sorted, "جدول به‌درستی نزولی مرتب است");

    // امتیاز کاربر probe را مستقل بازحساب می‌کنیم و با حافظهٔ سرور مقایسه می‌کنیم
    let expected=0;
    for(const mid in probePreds){ const d=WC.scoreOne(probePreds[mid], st.results[mid], st.cfg); if(d) expected+=d.total; }
    const probeRow = lb.find(r=>r.id===probe);
    eq(probeRow.total, expected, "امتیاز کاربر نمونه با بازحساب مستقل برابر است");

    // --- تغییر تنظیمات امتیاز توسط مدیر ---
    const cfgRes = await post("/api/config",{userId:adminId,cfg:{pOutcome:5,pOneTeam:1,pExact:10,pScorer:3}});
    eq(cfgRes.status, 200, "مدیر تنظیمات امتیاز را تغییر داد");
    st = await getState();
    eq(st.cfg.pExact, 10, "تنظیم جدید امتیاز ذخیره شد");

    // --- انتقال نقش مدیر ---
    const tr = await post("/api/admin/transfer",{userId:adminId,target:users[2].id});
    eq(tr.status, 200, "نقش مدیر منتقل شد");
    st = await getState();
    eq(st.admin, users[2].id, "مدیر جدید ثبت شد");
    // مدیر قبلی دیگر اجازه ندارد
    const ex = await post("/api/config",{userId:adminId,cfg:WC.DEFAULT_CFG});
    eq(ex.status, 403, "مدیر قبلی دیگر دسترسی مدیریتی ندارد");

    // --- پایداری: داده‌ها واقعاً روی دیسک ذخیره شده‌اند ---
    const onDisk = JSON.parse(fs.readFileSync(DATA,"utf8"));
    eq(onDisk.users.length, N, "داده‌ها روی دیسک ذخیره شده‌اند (پایداری بین ری‌استارت)");

  } finally {
    srv.kill();
    try{ fs.unlinkSync(DATA); }catch{}
    try{ fs.unlinkSync(DATA+".tmp"); }catch{}
  }
}

/* ===================== اجرا ===================== */
(async function(){
  console.log("════════ تست جامع سایت پیش‌بینی جام جهانی ۲۰۲۶ ════════");
  testScoring();
  testLock();
  testData();
  testLeaderboard();
  await testE2E();
  console.log("\n══════════════════════════════════════════════");
  console.log(`نتیجه:  ✓ ${pass} قبول    ✗ ${fail} رد`);
  if(fail){ console.log("\nتست‌های ردشده:"); fails.forEach(f=>console.log(" • "+f)); process.exit(1); }
  else console.log("✅ همهٔ تست‌ها با موفقیت قبول شدند.");
})();
