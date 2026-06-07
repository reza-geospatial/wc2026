/* ============================================================
   app.js  —  رابط کاربری (بدون فریم‌ورک، بدون مرحلهٔ build)
   ============================================================ */
(function(){
  const WC = window.WC;
  const $app = document.getElementById("app");

  // ---------- state ----------
  let TOKEN = localStorage.getItem("wc26_token") || null;
  let S = { users:[], admin:null, cfg:WC.DEFAULT_CFG, results:{}, leaderboard:[], me:null, myPreds:{} };
  let ME = null;                       // شناسهٔ کاربرِ واردشده
  let TAB = "predict";
  let GATE_MODE = "login";             // login | register
  let FILTER = { only:"upcoming", group:"all" };
  let ADMIN_VIEW = "results";
  let SERVER_OFFSET = 0;               // serverNow - clientNow

  const nowMs = () => Date.now() + SERVER_OFFSET;
  const myPreds = () => S.myPreds || {};
  const meUser = () => S.me;
  const isAdmin = () => S.me && S.admin === S.me.id;

  // ---------- api ----------
  function authHeaders(extra){ const h = extra ? { ...extra } : {}; if(TOKEN) h["Authorization"] = "Bearer " + TOKEN; return h; }
  async function getState(){
    const r = await fetch("/api/state", { headers: authHeaders() });
    const d = await r.json();
    SERVER_OFFSET = (Number(d.now)||Date.now()) - Date.now();
    S = { users:d.users||[], admin:d.admin||null, cfg:d.cfg||WC.DEFAULT_CFG, results:d.results||{},
          leaderboard:d.leaderboard||[], me:d.me||null, myPreds:d.myPreds||{} };
    ME = S.me ? S.me.id : null;
    return S;
  }
  async function post(path, body){
    const r = await fetch(path, { method:"POST", headers: authHeaders({ "Content-Type":"application/json" }), body:JSON.stringify(body||{}) });
    const d = await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(d.error || ("خطا "+r.status));
    return d;
  }
  async function doRegister(username, email, password){
    const d = await post("/api/register", { username, email, password });
    TOKEN = d.token; localStorage.setItem("wc26_token", TOKEN);
    await getState(); render();
  }
  async function doLogin(username, password){
    const d = await post("/api/login", { username, password });
    TOKEN = d.token; localStorage.setItem("wc26_token", TOKEN);
    await getState(); render();
  }
  function logout(){
    post("/api/logout", {}).catch(()=>{});
    TOKEN = null; localStorage.removeItem("wc26_token");
    S.me = null; ME = null; GATE_MODE = "login"; render();
  }

  // ---------- helpers ----------
  const esc = s => String(s==null?"":s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function toast(msg, err){
    const t=document.createElement("div"); t.className="toast"+(err?" err":""); t.textContent=msg;
    document.body.appendChild(t); setTimeout(()=>t.remove(), 2600);
  }
  function fmtDate(dt){ try{ return new Date(dt).toLocaleString("fa-IR",{weekday:"short",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"});}catch{ return new Date(dt).toLocaleString(); } }
  function dayKey(dt){ try{ return new Date(dt).toLocaleDateString("fa-IR",{weekday:"long",month:"long",day:"numeric"});}catch{ return new Date(dt).toDateString(); } }
  const locked = m => WC.isLocked(m, nowMs());

  // ============================================================ render
  function render(){
    if(!ME || !meUser()){ renderGate(); return; }
    const u = meUser();
    $app.innerHTML = `
      <div class="wrap">
        <header class="head">
          <div class="logo">
            <div class="logo-badge">🏆</div>
            <div><h1>جام پیش‌بینی ۲۰۲۶</h1><p>پیش‌بینی دوستانهٔ جام جهانی فیفا — آمریکا · کانادا · مکزیک</p></div>
          </div>
          <div class="who">
            <span class="chip-user">${isAdmin()?"🛡️ ":""}${esc(u.name)}</span>
            <button class="iconbtn" data-act="refresh" title="به‌روزرسانی">↻</button>
            <button class="iconbtn" data-act="logout">خروج</button>
          </div>
        </header>
        <nav class="tabs">
          ${tabBtn("predict","🎯 پیش‌بینی")}
          ${tabBtn("board","📊 جدول امتیازات")}
          ${tabBtn("history","🕘 تاریخچهٔ من")}
          ${tabBtn("rules","⭐ قوانین")}
          ${isAdmin()?tabBtn("admin","⚙️ مدیریت"):""}
        </nav>
        <div id="view"></div>
      </div>`;
    renderView();
    bindGlobal();
  }
  const tabBtn = (id,label)=>`<button class="tab ${TAB===id?"active":""}" data-tab="${id}">${label}</button>`;

  function renderView(){
    const v = document.getElementById("view");
    if(TAB==="predict") v.innerHTML = viewPredict();
    else if(TAB==="board") v.innerHTML = viewBoard();
    else if(TAB==="history") v.innerHTML = viewHistory();
    else if(TAB==="rules") v.innerHTML = viewRules();
    else if(TAB==="admin" && isAdmin()) v.innerHTML = viewAdmin();
    bindView();
  }

  // ---------- gate (login / register) ----------
  function renderGate(){
    const m = GATE_MODE;
    $app.innerHTML = `<div class="gate"><div class="box">
      <div class="big">🏆</div>
      <h2>جام پیش‌بینی ۲۰۲۶</h2>
      <p>${m==="login" ? "برای ادامه وارد حسابت شو." : "یک حساب بساز تا فقط خودت بتوانی پیش‌بینی‌هایت را ثبت و ویرایش کنی."}</p>
      <div class="authtabs">
        <button class="${m==="login"?"on":""}" data-mode="login">ورود</button>
        <button class="${m==="register"?"on":""}" data-mode="register">ثبت‌نام</button>
      </div>
      <input id="g-user" placeholder="نام‌کاربری" maxlength="30" autocomplete="username"/>
      ${m==="register" ? `<input id="g-email" type="email" placeholder="ایمیل" maxlength="120" autocomplete="email"/>` : ""}
      <input id="g-pass" type="password" placeholder="رمز عبور" autocomplete="${m==="login"?"current-password":"new-password"}"/>
      <button class="btn primary" style="width:100%;justify-content:center" data-act="submit">${m==="login"?"✓ ورود":"✓ ساخت حساب"}</button>
      <div class="note">${m==="register"
        ? "اولین کسی که ثبت‌نام کند «مدیر» بازی می‌شود (ثبت نتایج واقعی). ایمیل فقط برای شناساییِ حساب است و در سایت به کسی نشان داده نمی‌شود."
        : "حساب نداری؟ از بالا «ثبت‌نام» را بزن."}</div>
    </div></div>`;
    $app.querySelectorAll("[data-mode]").forEach(b=>b.onclick=()=>{ GATE_MODE=b.dataset.mode; renderGate(); });
    const submit=async()=>{
      const user=document.getElementById("g-user").value.trim();
      const pass=document.getElementById("g-pass").value;
      if(!user||!pass){ toast("نام‌کاربری و رمز را وارد کن",true); return; }
      try{
        if(m==="register"){
          const email=(document.getElementById("g-email")||{value:""}).value.trim();
          if(!/^\S+@\S+\.\S+$/.test(email)){ toast("ایمیل معتبر وارد کن",true); return; }
          if(pass.length<4){ toast("رمز عبور حداقل ۴ کاراکتر",true); return; }
          await doRegister(user,email,pass);
        } else await doLogin(user,pass);
      }catch(e){ toast(e.message,true); }
    };
    $app.querySelector('[data-act="submit"]').onclick=submit;
    $app.querySelectorAll(".gate input").forEach(i=>i.onkeydown=e=>{ if(e.key==="Enter") submit(); });
    document.getElementById("g-user").focus();
  }

  // ---------- predict ----------
  function viewPredict(){
    const mp=myPreds();
    const list = WC.MATCHES.filter(m=>{
      if(FILTER.group!=="all" && m.group!==FILTER.group) return false;
      if(FILTER.only==="upcoming" && locked(m)) return false;
      if(FILTER.only==="todo" && (mp[m.id]||locked(m))) return false;
      return true;
    });
    const days={};
    list.forEach(m=>{ const k=dayKey(m.dt); (days[k]=days[k]||[]).push(m); });
    const groupChips = Object.keys(WC.GROUPS).map(g=>`<button class="fchip ${FILTER.group===g?"on":""}" data-fg="${g}">گروه ${g}</button>`).join("");
    let html = `<div class="section">
      <div class="filters">
        <button class="fchip ${FILTER.only==="upcoming"?"on":""}" data-fo="upcoming">آینده</button>
        <button class="fchip ${FILTER.only==="todo"?"on":""}" data-fo="todo">پیش‌بینی‌نشده</button>
        <button class="fchip ${FILTER.only==="all"?"on":""}" data-fo="all">همه</button>
      </div>
      <div class="filters">
        <button class="fchip ${FILTER.group==="all"?"on":""}" data-fg="all">همهٔ گروه‌ها</button>${groupChips}
      </div>`;
    const keys=Object.keys(days);
    if(!keys.length) html+=`<div class="empty">مسابقه‌ای با این فیلتر پیدا نشد.</div>`;
    keys.forEach(d=>{
      html+=`<div class="daygroup"><div class="dayhdr">📅 ${d}<span class="ln"></span></div>`;
      days[d].forEach(m=> html+=matchCard(m));
      html+=`</div>`;
    });
    return html+`</div>`;
  }

  function matchCard(m){
    const T=WC.TEAMS, hm=T[m.home], am=T[m.away];
    const mp=myPreds(), pred=mp[m.id], res=S.results[m.id];
    const lk=locked(m);
    const players=[...(hm.p||[]),...(am.p||[])];
    const dl="dl-"+m.id;
    const bd = (res && res.h!=null) ? WC.scoreOne(pred,res,S.cfg) : null;
    return `<div class="card" data-mid="${m.id}">
      <div class="meta">
        <span class="gbadge">گروه ${m.group}</span>
        <span>${fmtDate(m.dt)}</span><span>· ${esc(m.venue)}</span>
        ${lk?`<span class="lockbadge">🔒 قفل شد</span>`:(pred?`<span class="savedbadge">✓ ثبت‌شده</span>`:"")}
      </div>
      <div class="matchrow">
        <div class="team"><span class="flag">${hm.f}</span><span class="tname">${esc(hm.n)}</span></div>
        <div class="vs">
          <input class="score-in" id="h-${m.id}" type="number" min="0" max="20" value="${pred?pred.h:""}" ${lk?"disabled":""} placeholder="−"/>
          <span class="dash">:</span>
          <input class="score-in" id="a-${m.id}" type="number" min="0" max="20" value="${pred?pred.a:""}" ${lk?"disabled":""} placeholder="−"/>
        </div>
        <div class="team away"><span class="flag">${am.f}</span><span class="tname">${esc(am.n)}</span></div>
      </div>
      <div class="scorers">
        <div class="lbl">🎯 گلزن‌ها (حداکثر ۲ نفر — اختیاری)</div>
        <datalist id="${dl}">${players.map(p=>`<option value="${esc(p)}"></option>`).join("")}</datalist>
        <div class="scorer-ins">
          <input class="txt-in" id="s1-${m.id}" list="${dl}" value="${pred&&pred.s?esc(pred.s[0]||""):""}" ${lk?"disabled":""} placeholder="گلزن اول…"/>
          <input class="txt-in" id="s2-${m.id}" list="${dl}" value="${pred&&pred.s?esc(pred.s[1]||""):""}" ${lk?"disabled":""} placeholder="گلزن دوم…"/>
        </div>
      </div>
      ${lk?"":`<div class="cardfoot">
        <button class="btn primary" data-act="save-pred" data-mid="${m.id}">💾 ثبت پیش‌بینی</button>
        ${pred?`<span style="font-size:12px;color:var(--muted)">پیش‌بینی فعلی: ${pred.h} - ${pred.a}</span>`:""}
      </div>`}
      ${(res&&res.h!=null)?`<div class="result-strip">
        <div class="rsline"><b style="color:#fff">نتیجهٔ واقعی: ${res.h} - ${res.a}</b>${(res.s&&res.s.length)?`<span>· گلزن‌ها: ${esc(res.s.join("، "))}</span>`:""}</div>
        ${(pred&&bd)?`<div class="bd">
          <span class="${bd.outcome?"pos":""}">برد/باخت: ${bd.outcome}</span>
          <span class="${bd.team?"pos":""}">یک تیم: ${bd.team}</span>
          <span class="${bd.exact?"pos":""}">نتیجهٔ دقیق: ${bd.exact}</span>
          <span class="${bd.scorer?"pos":""}">گلزن: ${bd.scorer}</span>
          <span class="pos" style="font-weight:800">مجموع: ${bd.total} امتیاز</span>
        </div>`:(!pred?`<div class="bd"><span>پیش‌بینی نکرده بودی</span></div>`:"")}
      </div>`:""}
    </div>`;
  }

  // ---------- board ----------
  function viewBoard(){
    const rows = S.leaderboard || [];
    const anyResult = Object.values(S.results).some(r=>r&&r.h!=null);
    let html=`<div class="section"><div class="lb">`;
    if(!rows.length) html+=`<div class="empty">هنوز کاربری ثبت‌نام نکرده.</div>`;
    rows.forEach((r,i)=>{
      const g=i===0?"g1":i===1?"g2":i===2?"g3":"";
      html+=`<div class="lbrow ${r.id===ME?"me":""}">
        <div class="rank ${g}">${i+1}</div>
        <div><div class="lbname">${esc(r.name)}${r.id===ME?" (تو)":""}</div>
          <div class="lbsub">${r.predCount} پیش‌بینی · ${r.exact} نتیجهٔ دقیق · ${r.outcome} برد/باخت درست · ${r.scorers} گلزن درست</div></div>
        <div class="lbpts"><b>${r.total}</b><small>امتیاز</small></div>
      </div>`;
    });
    html+=`</div>`;
    if(!anyResult) html+=`<div class="note">هنوز نتیجهٔ واقعی هیچ مسابقه‌ای ثبت نشده، پس امتیازها صفر است. به‌محض اینکه مدیر نتایج را وارد کند جدول به‌روز می‌شود.</div>`;
    return html+`</div>`;
  }

  // ---------- history ----------
  function viewHistory(){
    const mp=myPreds();
    const done=WC.MATCHES.filter(m=>S.results[m.id]&&S.results[m.id].h!=null&&mp[m.id]);
    const total=done.reduce((s,m)=>s+(WC.scoreOne(mp[m.id],S.results[m.id],S.cfg)?.total||0),0);
    let html=`<div class="section">
      <div class="panel" style="display:flex;align-items:center;gap:14px">
        <div style="font-size:34px">🏆</div>
        <div><div style="font-size:13px;color:var(--muted)">مجموع امتیاز تو</div>
          <div class="num" style="font-size:34px;color:var(--accent)">${total}</div></div>
        <div style="margin-inline-start:auto;text-align:left;font-size:13px;color:var(--muted)">
          ${done.length} مسابقهٔ امتیازدهی‌شده<br/>${Object.keys(mp).length} پیش‌بینی ثبت‌شده</div>
      </div>`;
    if(!done.length) html+=`<div class="empty">هنوز هیچ مسابقه‌ای که پیش‌بینی کرده باشی نتیجه‌اش ثبت نشده.</div>`;
    const T=WC.TEAMS;
    done.forEach(m=>{
      const p=mp[m.id], r=S.results[m.id], d=WC.scoreOne(p,r,S.cfg);
      html+=`<div class="card">
        <div class="meta"><span class="gbadge">گروه ${m.group}</span><span>${fmtDate(m.dt)}</span>
          <span class="ptspill">⭐ ${d.total} امتیاز</span></div>
        <div class="matchrow">
          <div class="team"><span class="flag">${T[m.home].f}</span><span class="tname">${esc(T[m.home].n)}</span></div>
          <div class="vs"><div style="text-align:center">
            <div class="num" style="font-size:22px">${r.h} : ${r.a}</div>
            <div style="font-size:10px;color:var(--muted)">واقعی</div>
            <div style="font-size:12px;margin-top:4px;color:var(--blue)">تو: ${p.h} : ${p.a}</div>
          </div></div>
          <div class="team away"><span class="flag">${T[m.away].f}</span><span class="tname">${esc(T[m.away].n)}</span></div>
        </div>
        <div class="bd" style="margin-top:12px">
          <span class="${d.outcome?"pos":""}">برد/باخت: ${d.outcome}</span>
          <span class="${d.team?"pos":""}">یک تیم: ${d.team}</span>
          <span class="${d.exact?"pos":""}">دقیق: ${d.exact}</span>
          <span class="${d.scorer?"pos":""}">گلزن: ${d.scorer}</span>
        </div>
        ${(p.s&&p.s.length)?`<div style="font-size:12px;color:var(--muted);margin-top:8px">گلزن‌های تو: ${esc(p.s.join("، "))}${(r.s&&r.s.length)?` · واقعی: ${esc(r.s.join("، "))}`:""}</div>`:""}
      </div>`;
    });
    return html+`</div>`;
  }

  // ---------- rules ----------
  function viewRules(){
    const c=S.cfg, max=c.pOutcome+c.pExact+c.pScorer*2;
    return `<div class="section"><div class="panel">
      <h3>سیستم امتیازدهی</h3>
      <p class="sub">امتیازهای هر بازی جمع‌پذیرند. سقف امتیاز هر بازی: ${max} امتیاز.</p>
      <div class="rule"><div class="ic">✓</div><div><b>پیش‌بینی درست برد / مساوی / باخت</b>
        <p>اگر فقط جهت نتیجه را درست بزنی.</p></div><div class="pt">+${c.pOutcome}</div></div>
      <div class="rule"><div class="ic">🎯</div><div><b>تعداد گل یکی از دو تیم درست</b>
        <p>اگر تعداد گل دقیقِ یکی از دو تیم را درست بزنی (نه هر دو).</p></div><div class="pt">+${c.pOneTeam}</div></div>
      <div class="rule"><div class="ic">⭐</div><div><b>نتیجهٔ کاملاً دقیق (هر دو تیم)</b>
        <p>اگر تعداد گل هر دو تیم را دقیق بزنی. این جایزه به‌علاوهٔ امتیاز برد/باخت می‌نشیند.</p></div><div class="pt">+${c.pExact}</div></div>
      <div class="rule"><div class="ic">👥</div><div><b>هر گلزن درست (حداکثر ۲ نفر)</b>
        <p>برای هر بازیکنی که پیش‌بینی کنی گل می‌زند و واقعاً بزند.</p></div><div class="pt">+${c.pScorer}</div></div>
      <div class="note">مثال: نتیجهٔ واقعی برزیل ۲ - ۱ و گلزن وینیسیوس. پیش‌بینی «۲-۱» با گلزن وینیسیوس →
        برد/باخت (${c.pOutcome}) + دقیق (${c.pExact}) + گلزن (${c.pScorer}) = ${c.pOutcome+c.pExact+c.pScorer} امتیاز.</div>
    </div></div>`;
  }

  // ---------- admin ----------
  function viewAdmin(){
    const av=ADMIN_VIEW;
    let html=`<div class="section"><div class="filters" style="margin-top:18px">
      <button class="fchip ${av==="results"?"on":""}" data-av="results">ثبت نتایج</button>
      <button class="fchip ${av==="scoring"?"on":""}" data-av="scoring">تنظیم امتیازها</button>
      <button class="fchip ${av==="people"?"on":""}" data-av="people">کاربران</button>
    </div>`;
    if(av==="results"){
      html+=`<div class="note" style="margin-top:0">نتیجهٔ واقعی هر مسابقه را وارد کن. به‌محض ذخیره، امتیاز همه خودکار حساب می‌شود.</div>
        <div class="filters"><button class="fchip ${FILTER.group==="all"?"on":""}" data-fg="all">همه</button>
        ${Object.keys(WC.GROUPS).map(g=>`<button class="fchip ${FILTER.group===g?"on":""}" data-fg="${g}">گروه ${g}</button>`).join("")}</div>`;
      WC.MATCHES.filter(m=>FILTER.group==="all"||m.group===FILTER.group).forEach(m=>html+=resultCard(m));
    } else if(av==="scoring"){
      const c=S.cfg;
      html+=`<div class="panel"><h3>تنظیم وزن امتیازها</h3>
        <p class="sub">قوانین امتیازدهی برای همهٔ گروه مشترک است.</p>
        <div class="cfg-grid">
          <div><label>برد/مساوی/باخت درست</label><input id="c-pOutcome" type="number" value="${c.pOutcome}"/></div>
          <div><label>تعداد گل یک تیم درست</label><input id="c-pOneTeam" type="number" value="${c.pOneTeam}"/></div>
          <div><label>نتیجهٔ کاملاً دقیق</label><input id="c-pExact" type="number" value="${c.pExact}"/></div>
          <div><label>هر گلزن درست</label><input id="c-pScorer" type="number" value="${c.pScorer}"/></div>
        </div>
        <div class="cardfoot"><button class="btn primary" data-act="save-cfg">💾 ذخیرهٔ تنظیمات</button></div></div>`;
    } else {
      html+=`<div class="panel"><h3>کاربران بازی</h3><p class="sub">می‌توانی نقش مدیر را به دیگری بدهی.</p>`;
      S.users.forEach(u=>{
        html+=`<div class="rule"><div class="ic">👤</div>
          <div><b>${esc(u.name)}</b><p>${u.id===S.admin?"مدیر فعلی":"کاربر"}</p></div>
          ${u.id!==S.admin?`<button class="btn ghost" style="margin-inline-start:auto" data-act="make-admin" data-uid="${u.id}">🛡️ مدیر کن</button>`:""}</div>`;
      });
      html+=`</div>`;
    }
    return html+`</div>`;
  }
  function resultCard(m){
    const T=WC.TEAMS, hm=T[m.home], am=T[m.away], res=S.results[m.id];
    const players=[...(hm.p||[]),...(am.p||[])], dl="rdl-"+m.id;
    return `<div class="card" data-mid="${m.id}">
      <div class="meta"><span class="gbadge">گروه ${m.group}</span><span>${fmtDate(m.dt)}</span>
        ${(res&&res.h!=null)?`<span class="savedbadge">✓ ثبت‌شده</span>`:""}</div>
      <div class="matchrow">
        <div class="team"><span class="flag">${hm.f}</span><span class="tname">${esc(hm.n)}</span></div>
        <div class="vs">
          <input class="score-in" id="rh-${m.id}" type="number" min="0" value="${res?res.h:""}" placeholder="−"/>
          <span class="dash">:</span>
          <input class="score-in" id="ra-${m.id}" type="number" min="0" value="${res?res.a:""}" placeholder="−"/>
        </div>
        <div class="team away"><span class="flag">${am.f}</span><span class="tname">${esc(am.n)}</span></div>
      </div>
      <div class="scorers"><div class="lbl">🎯 گلزن‌های واقعی (با کاما جدا کن — برای هت‌تریک نام را تکرار کن)</div>
        <datalist id="${dl}">${players.map(p=>`<option value="${esc(p)}"></option>`).join("")}</datalist>
        <input class="txt-in" id="rs-${m.id}" list="${dl}" value="${res&&res.s?esc(res.s.join("، ")):""}" placeholder="مثلاً: Vinícius Júnior، Raphinha"/>
      </div>
      <div class="cardfoot"><button class="btn primary" data-act="save-result" data-mid="${m.id}">💾 ثبت نتیجه</button></div>
    </div>`;
  }

  // ============================================================ events
  function bindGlobal(){
    $app.querySelectorAll("[data-tab]").forEach(b=>b.onclick=async()=>{ TAB=b.dataset.tab; try{await getState();}catch{} renderView(); updateTabs(); });
    const rf=$app.querySelector('[data-act="refresh"]'); if(rf) rf.onclick=async()=>{ try{await getState(); renderView(); toast("به‌روزرسانی شد");}catch(e){toast(e.message,true);} };
    const lo=$app.querySelector('[data-act="logout"]'); if(lo) lo.onclick=()=>{ logout(); };
  }
  function updateTabs(){ $app.querySelectorAll("[data-tab]").forEach(b=>b.classList.toggle("active", b.dataset.tab===TAB)); }

  function bindView(){
    const v=document.getElementById("view");
    v.querySelectorAll("[data-fo]").forEach(b=>b.onclick=()=>{ FILTER.only=b.dataset.fo; renderView(); });
    v.querySelectorAll("[data-fg]").forEach(b=>b.onclick=()=>{ FILTER.group=b.dataset.fg; renderView(); });
    v.querySelectorAll("[data-av]").forEach(b=>b.onclick=()=>{ ADMIN_VIEW=b.dataset.av; renderView(); });

    v.querySelectorAll('[data-act="save-pred"]').forEach(b=>b.onclick=async()=>{
      const id=b.dataset.mid;
      const h=document.getElementById("h-"+id).value, a=document.getElementById("a-"+id).value;
      const s1=document.getElementById("s1-"+id).value, s2=document.getElementById("s2-"+id).value;
      if(h===""||a===""){ toast("نتیجه را وارد کن",true); return; }
      try{
        await post("/api/prediction",{ userId:ME, matchId:id, h:Number(h), a:Number(a), s:[s1,s2].map(x=>x.trim()).filter(Boolean) });
        await getState(); toast("پیش‌بینی ثبت شد"); renderView();
      }catch(e){ toast(e.message,true); await getState(); renderView(); }
    });

    v.querySelectorAll('[data-act="save-result"]').forEach(b=>b.onclick=async()=>{
      const id=b.dataset.mid;
      const h=document.getElementById("rh-"+id).value, a=document.getElementById("ra-"+id).value;
      const sc=document.getElementById("rs-"+id).value;
      if(h===""||a===""){ toast("نتیجه را وارد کن",true); return; }
      try{
        await post("/api/result",{ userId:ME, matchId:id, h:Number(h), a:Number(a), s:sc.split(/[،,]/).map(x=>x.trim()).filter(Boolean) });
        await getState(); toast("نتیجه ثبت شد"); renderView();
      }catch(e){ toast(e.message,true); }
    });

    const sc=v.querySelector('[data-act="save-cfg"]'); if(sc) sc.onclick=async()=>{
      const cfg={ pOutcome:+document.getElementById("c-pOutcome").value, pOneTeam:+document.getElementById("c-pOneTeam").value,
        pExact:+document.getElementById("c-pExact").value, pScorer:+document.getElementById("c-pScorer").value };
      try{ await post("/api/config",{ userId:ME, cfg }); await getState(); toast("تنظیمات ذخیره شد"); renderView(); }catch(e){ toast(e.message,true); }
    };

    v.querySelectorAll('[data-act="make-admin"]').forEach(b=>b.onclick=async()=>{
      try{ await post("/api/admin/transfer",{ userId:ME, target:b.dataset.uid }); await getState(); toast("مدیر تغییر کرد"); render(); }catch(e){ toast(e.message,true); }
    });
  }

  // به‌روزرسانی خودکار وقتی روی تب پیش‌بینی نیستی (تا تایپِ کاربر قطع نشود)
  setInterval(async()=>{
    if(document.hidden || !ME || TAB==="predict" || (TAB==="admin")) return;
    try{ await getState(); renderView(); }catch{}
  }, 45000);

  // ---------- boot ----------
  (async function(){
    try{ await getState(); }catch(e){ $app.innerHTML=`<div class="empty">اتصال به سرور ممکن نشد. مطمئن شو سرور اجراست.</div>`; return; }
    if(TOKEN && !S.me){ TOKEN=null; localStorage.removeItem("wc26_token"); } // توکن منقضی/نامعتبر
    GATE_MODE = (S.users && S.users.length) ? "login" : "register";
    render();
  })();
})();
