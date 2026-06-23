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
          leaderboard:d.leaderboard||[], me:d.me||null, myPreds:d.myPreds||{},
          champion:d.champion||null, myChamp:d.myChamp||null };
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
    if(d.recoveryCode) showRecoveryModal(d.recoveryCode);
  }
  async function doLogin(username, password){
    const d = await post("/api/login", { username, password });
    TOKEN = d.token; localStorage.setItem("wc26_token", TOKEN);
    await getState(); render();
    if(d.recoveryCode) showRecoveryModal(d.recoveryCode);
  }
  async function doRecover(username, recoveryCode, newPassword){
    const d = await post("/api/recover", { username, recoveryCode, newPassword });
    TOKEN = d.token; localStorage.setItem("wc26_token", TOKEN);
    await getState(); render();
    toast("رمز جدید ثبت شد و وارد شدی");
  }
  function logout(){
    post("/api/logout", {}).catch(()=>{});
    TOKEN = null; localStorage.removeItem("wc26_token");
    S.me = null; ME = null; GATE_MODE = "login"; render();
  }

  // ---------- modal ----------
  function showModal(inner, onMount){
    const ov = document.createElement("div"); ov.className = "modal-ov";
    ov.innerHTML = `<div class="modal">${inner}</div>`;
    ov.addEventListener("click", e => { if(e.target === ov) ov.remove(); });
    document.body.appendChild(ov);
    if(onMount) onMount(ov);
    return ov;
  }
  function showRecoveryModal(code){
    showModal(`
      <div class="big" style="margin:0 auto 12px">🔑</div>
      <h3>کد بازیابی تو</h3>
      <p class="sub">اگر رمزت را فراموش کردی، با این کد می‌توانی رمز جدید بسازی. <b>همین حالا ذخیره‌اش کن</b> — این کد فقط همین یک‌بار نشان داده می‌شود.</p>
      <div class="reccode">${esc(code)}</div>
      <div class="cardfoot">
        <button class="btn ghost" data-act="copy">📋 کپی</button>
        <button class="btn primary" data-act="ok">ذخیره کردم، ادامه</button>
      </div>`, ov => {
        ov.querySelector('[data-act="copy"]').onclick = () => {
          (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject()).then(()=>toast("کپی شد")).catch(()=>toast("دستی کپی کن",true));
        };
        ov.querySelector('[data-act="ok"]').onclick = () => ov.remove();
      });
  }
  function showTempPwModal(name, temp){
    showModal(`
      <h3>رمز موقت برای «${esc(name)}»</h3>
      <p class="sub">این رمز موقت را به این کاربر بده. او با آن وارد می‌شود و بعد می‌تواند از «تغییر رمز» رمز دلخواهش را بگذارد.</p>
      <div class="reccode">${esc(temp)}</div>
      <div class="cardfoot" style="justify-content:center"><button class="btn primary" data-act="ok">باشه</button></div>`,
      ov => { ov.querySelector('[data-act="ok"]').onclick = () => ov.remove(); });
  }
  function showChangePwModal(){
    showModal(`
      <h3>تغییر رمز</h3>
      <input id="cp-old" type="password" placeholder="رمز فعلی" autocomplete="current-password"/>
      <input id="cp-new" type="password" placeholder="رمز جدید" autocomplete="new-password"/>
      <div class="cardfoot" style="justify-content:center">
        <button class="btn ghost" data-act="cancel">انصراف</button>
        <button class="btn primary" data-act="save">ذخیره</button>
      </div>`, ov => {
        ov.querySelector('[data-act="cancel"]').onclick = () => ov.remove();
        ov.querySelector('[data-act="save"]').onclick = async () => {
          const oldPassword = ov.querySelector("#cp-old").value;
          const newPassword = ov.querySelector("#cp-new").value;
          if(newPassword.length < 4){ toast("رمز جدید حداقل ۴ کاراکتر",true); return; }
          try{ await post("/api/change-password",{ oldPassword, newPassword }); ov.remove(); toast("رمز تغییر کرد"); }
          catch(e){ toast(e.message,true); }
        };
      });
  }

  // ---------- helpers ----------
  const esc = s => String(s==null?"":s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function toast(msg, err){
    const t=document.createElement("div"); t.className="toast"+(err?" err":""); t.textContent=msg;
    document.body.appendChild(t); setTimeout(()=>t.remove(), 2600);
  }
  function fmtDate(dt){ try{ return new Date(dt).toLocaleString("en-GB",{weekday:"short",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit",hour12:false});}catch{ return new Date(dt).toLocaleString("en-GB"); } }
  function dayKey(dt){ try{ return new Date(dt).toLocaleDateString("en-GB",{weekday:"long",month:"long",day:"numeric"});}catch{ return new Date(dt).toDateString(); } }
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
            <button class="iconbtn" data-act="chpw" title="تغییر رمز">🔑</button>
            <button class="iconbtn" data-act="refresh" title="به‌روزرسانی">↻</button>
            <button class="iconbtn" data-act="logout">خروج</button>
          </div>
        </header>
        <nav class="tabs">
          ${tabBtn("predict","🎯 پیش‌بینی")}
          ${tabBtn("champion","🏆 قهرمان")}
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
    else if(TAB==="champion") v.innerHTML = viewChampion();
    else if(TAB==="board") v.innerHTML = viewBoard();
    else if(TAB==="history") v.innerHTML = viewHistory();
    else if(TAB==="rules") v.innerHTML = viewRules();
    else if(TAB==="admin" && isAdmin()) v.innerHTML = viewAdmin();
    bindView();
  }

  // ---------- gate (login / register / recover) ----------
  function renderGate(){
    const m = GATE_MODE;
    const desc = m==="login" ? "برای ادامه وارد حسابت شو."
      : m==="register" ? "یک حساب بساز تا فقط خودت بتوانی پیش‌بینی‌هایت را ثبت و ویرایش کنی."
      : "نام‌کاربری و کد بازیابی‌ات را وارد کن تا رمز جدید بسازی.";
    let fields;
    if(m==="recover"){
      fields = `<input id="g-user" placeholder="نام‌کاربری" maxlength="30" autocomplete="username"/>
        <input id="g-code" placeholder="کد بازیابی (XXXX-XXXX-XXXX-XXXX)" autocomplete="off" style="direction:ltr;text-align:center"/>
        <input id="g-pass" type="password" placeholder="رمز جدید" autocomplete="new-password"/>`;
    } else {
      fields = `<input id="g-user" placeholder="نام‌کاربری" maxlength="30" autocomplete="username"/>
        ${m==="register" ? `<input id="g-email" type="email" placeholder="ایمیل" maxlength="120" autocomplete="email"/>` : ""}
        <input id="g-pass" type="password" placeholder="رمز عبور" autocomplete="${m==="login"?"current-password":"new-password"}"/>`;
    }
    const btnLabel = m==="login" ? "✓ ورود" : m==="register" ? "✓ ساخت حساب" : "✓ ثبت رمز جدید";
    $app.innerHTML = `<div class="gate"><div class="box">
      <div class="big">🏆</div>
      <h2>جام پیش‌بینی ۲۰۲۶</h2>
      <p>${desc}</p>
      ${m!=="recover" ? `<div class="authtabs">
        <button class="${m==="login"?"on":""}" data-mode="login">ورود</button>
        <button class="${m==="register"?"on":""}" data-mode="register">ثبت‌نام</button>
      </div>` : ""}
      ${fields}
      <button class="btn primary" style="width:100%;justify-content:center" data-act="submit">${btnLabel}</button>
      ${m==="login" ? `<button class="linkbtn" data-mode="recover">رمزت را فراموش کردی؟</button>` : ""}
      ${m==="recover" ? `<button class="linkbtn" data-mode="login">‹ بازگشت به ورود</button>` : ""}
      <div class="note">${m==="register"
        ? "اولین کسی که ثبت‌نام کند «مدیر» بازی می‌شود (ثبت نتایج واقعی). بعد از ثبت‌نام یک «کد بازیابی» می‌گیری که باید ذخیره‌اش کنی. ایمیل فقط برای شناساییِ حساب است و به کسی نشان داده نمی‌شود."
        : m==="recover" ? "کد بازیابی همان است که موقع ثبت‌نام گرفتی. اگر آن را نداری، از مدیر بخواه رمزت را ریست کند."
        : "حساب نداری؟ از بالا «ثبت‌نام» را بزن."}</div>
    </div></div>`;
    $app.querySelectorAll("[data-mode]").forEach(b=>b.onclick=()=>{ GATE_MODE=b.dataset.mode; renderGate(); });
    const submit=async()=>{
      const user=document.getElementById("g-user").value.trim();
      const pass=document.getElementById("g-pass").value;
      if(!user||!pass){ toast("همهٔ کادرها را پر کن",true); return; }
      try{
        if(m==="register"){
          const email=(document.getElementById("g-email")||{value:""}).value.trim();
          if(!/^\S+@\S+\.\S+$/.test(email)){ toast("ایمیل معتبر وارد کن",true); return; }
          if(pass.length<4){ toast("رمز عبور حداقل ۴ کاراکتر",true); return; }
          await doRegister(user,email,pass);
        } else if(m==="recover"){
          const code=document.getElementById("g-code").value.trim();
          if(!code){ toast("کد بازیابی را وارد کن",true); return; }
          if(pass.length<4){ toast("رمز جدید حداقل ۴ کاراکتر",true); return; }
          await doRecover(user,code,pass);
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

  // ===== اتوکامپلیتِ گلزن (جایگزینِ datalist که روی موبایل فقط ۳ پیشنهاد نشان می‌داد) =====
  const ACLISTS = {};
  function acNorm(s){
    return (s||"").toString().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      .replace(/[øØ]/g,"o").replace(/[łŁ]/g,"l").replace(/[đĐðÐ]/g,"d")
      .replace(/[ıİ]/g,"i").replace(/ß/g,"ss").replace(/[æÆ]/g,"ae").replace(/[œŒ]/g,"oe")
      .toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
  }
  function acInput(e){ return e.target.closest && e.target.closest("input[data-ac]"); }
  function acItemOf(e){ return e.target.closest && e.target.closest(".ac-item"); }
  function acToken(inp){
    if(inp.dataset.acMulti){ const p=inp.value.split(/[,،]/); return p[p.length-1].trim(); }
    return inp.value.trim();
  }
  function acShow(inp){
    const box=document.getElementById("acl-"+inp.id); if(!box) return;
    const list=ACLISTS[inp.dataset.ac]||[];
    const q=acNorm(acToken(inp));
    const opts = q ? list.filter(n=>acNorm(n).indexOf(q)>=0) : list.slice();
    if(!opts.length){ box.style.display="none"; box.innerHTML=""; return; }
    box.innerHTML = opts.map(n=>`<div class="ac-item" data-name="${esc(n)}">${esc(n)}</div>`).join("");
    box.scrollTop=0; box.style.display="block";
  }
  function acHide(inp){ const box=document.getElementById("acl-"+inp.id); if(box) box.style.display="none"; }
  function acChoose(it){
    const box=it.closest(".ac-list"); const inp=box && box.previousElementSibling;
    if(!inp||!inp.matches("input[data-ac]")) return;
    const name=it.dataset.name;
    if(inp.dataset.acMulti){
      const parts=inp.value.split(/[,،]/).map(x=>x.trim());
      parts[parts.length-1]=name;
      inp.value=parts.filter(Boolean).join("، ")+"، "; // جداکننده برای گلزن بعدی (تکرار برای هت‌تریک مجاز است)
      inp.focus(); acShow(inp);
    } else { inp.value=name; acHide(inp); }
  }
  let acBound=false, acTouchY=null, acMoved=false;
  function bindAutocompleteOnce(){
    if(acBound) return; acBound=true;
    document.addEventListener("focusin", e=>{ const i=acInput(e); if(i) acShow(i); });
    document.addEventListener("input",   e=>{ const i=acInput(e); if(i) acShow(i); });
    document.addEventListener("focusout",e=>{ const i=acInput(e); if(i){ const inp=i; setTimeout(()=>acHide(inp),200); } });
    // دسکتاپ: کلیک
    document.addEventListener("mousedown", e=>{ const it=acItemOf(e); if(it){ e.preventDefault(); acChoose(it); } });
    // موبایل: تشخیص «تپ» از «اسکرول» تا هم انتخاب کار کند هم لیست اسکرول شود
    document.addEventListener("touchstart", e=>{ const it=acItemOf(e); if(it){ acTouchY=e.touches[0].clientY; acMoved=false; } }, {passive:true});
    document.addEventListener("touchmove",  e=>{ if(acTouchY!=null && Math.abs(e.touches[0].clientY-acTouchY)>10) acMoved=true; }, {passive:true});
    document.addEventListener("touchend",   e=>{ const it=acItemOf(e); if(it && !acMoved){ e.preventDefault(); acChoose(it); } acTouchY=null; });
  }

  function matchCard(m){
    const T=WC.TEAMS, hm=T[m.home], am=T[m.away];
    const mp=myPreds(), pred=mp[m.id], res=S.results[m.id];
    const lk=locked(m);
    const players=[...(hm.p||[]),...(am.p||[])];
    ACLISTS[m.id]=players;
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
        <div class="scorer-ins">
          <div class="ac-wrap">
            <input class="txt-in" id="s1-${m.id}" data-ac="${m.id}" autocomplete="off" value="${pred&&pred.s?esc(pred.s[0]||""):""}" ${lk?"disabled":""} placeholder="گلزن اول…"/>
            <div class="ac-list" id="acl-s1-${m.id}"></div>
          </div>
          <div class="ac-wrap">
            <input class="txt-in" id="s2-${m.id}" data-ac="${m.id}" autocomplete="off" value="${pred&&pred.s?esc(pred.s[1]||""):""}" ${lk?"disabled":""} placeholder="گلزن دوم…"/>
            <div class="ac-list" id="acl-s2-${m.id}"></div>
          </div>
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

  // ---------- champion ----------
  function viewChampion(){
    const locked = WC.championLocked(nowMs());
    const decided = !!S.champion;
    const mine = S.myChamp;
    let html = `<div class="section">`;

    if(decided){
      const ch = WC.TEAMS[S.champion];
      const hit = mine && mine===S.champion;
      html += `<div class="champ-banner ${hit?"win":""}">
        <div style="font-size:13px;color:var(--muted)">قهرمان جام جهانی ۲۰۲۶</div>
        <div class="champ-name"><span class="flag">${ch.f}</span> ${esc(ch.n)}</div>
        ${mine ? (hit
          ? `<div class="champ-msg win">🎉 آفرین! درست زدی و ${S.cfg.pChampion} امتیاز گرفتی.</div>`
          : `<div class="champ-msg">پیش‌بینی تو: ${WC.TEAMS[mine]?WC.TEAMS[mine].f+" "+esc(WC.TEAMS[mine].n):"—"} — این بار نشد.</div>`)
          : `<div class="champ-msg">تو قهرمان را پیش‌بینی نکرده بودی.</div>`}
      </div>`;
    } else {
      html += `<div class="note" style="margin-top:18px">
        قهرمانِ کل جام جهانی را پیش‌بینی کن! اگر درست بزنی <b>${S.cfg.pChampion} امتیاز</b> می‌گیری.
        ${locked ? "⛔ مهلت پیش‌بینی قهرمان (۲۵ ژوئن) تمام شده است." : "تا پایان ۲۵ ژوئن می‌توانی انتخابت را ثبت یا عوض کنی."}
      </div>`;
    }

    html += `<div class="champgrid">`;
    WC.CHAMP_TEAMS.forEach(tid=>{
      const t = WC.TEAMS[tid];
      const sel = mine===tid;
      const isChamp = decided && S.champion===tid;
      const dis = locked || decided;
      html += `<button class="champ-team ${sel?"sel":""} ${isChamp?"ischamp":""}" ${dis?"disabled":""} data-act="pick-champ" data-team="${tid}">
        <span class="flag">${t.f}</span>
        <span class="cname">${esc(t.n)}</span>
        ${sel?`<span class="pick-badge">${decided? (isChamp?"✓":"انتخاب تو") : "انتخاب تو"}</span>`:""}
        ${isChamp&&!sel?`<span class="pick-badge gold">قهرمان</span>`:""}
      </button>`;
    });
    html += `</div>`;

    if(!locked && !decided){
      html += `<div style="text-align:center;color:var(--muted);font-size:12.5px;margin-top:14px">
        ${mine ? "می‌توانی تا پایان ۲۵ ژوئن انتخابت را تغییر دهی." : "روی یک تیم بزن تا ثبت شود."}</div>`;
    }
    return html + `</div>`;
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
          <div class="lbsub">${r.predCount} پیش‌بینی · ${r.exact} نتیجهٔ دقیق · ${r.team} گل یک تیم درست · ${r.outcome} برد/باخت درست · ${r.scorers} گلزن درست${r.champHit?" · 🏆 قهرمان درست":""}</div></div>
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
      <div class="rule"><div class="ic">🏆</div><div><b>قهرمان جام را درست بزنی</b>
        <p>اگر تیمی که برندهٔ کل جام می‌شود را در تب «قهرمان» درست پیش‌بینی کنی (فقط تا قبل از شروع جام).</p></div><div class="pt">+${c.pChampion}</div></div>
      <div class="note">مثال: نتیجهٔ واقعی برزیل ۲ - ۱ و گلزن وینیسیوس. پیش‌بینی «۲-۱» با گلزن وینیسیوس →
        برد/باخت (${c.pOutcome}) + دقیق (${c.pExact}) + گلزن (${c.pScorer}) = ${c.pOutcome+c.pExact+c.pScorer} امتیاز.</div>
    </div></div>`;
  }

  // ---------- admin ----------
  function viewAdmin(){
    const av=ADMIN_VIEW;
    let html=`<div class="section"><div class="filters" style="margin-top:18px">
      <button class="fchip ${av==="results"?"on":""}" data-av="results">ثبت نتایج</button>
      <button class="fchip ${av==="champion"?"on":""}" data-av="champion">قهرمان جام</button>
      <button class="fchip ${av==="scoring"?"on":""}" data-av="scoring">تنظیم امتیازها</button>
      <button class="fchip ${av==="people"?"on":""}" data-av="people">کاربران</button>
    </div>`;
    if(av==="results"){
      html+=`<div class="note" style="margin-top:0">نتیجهٔ واقعی هر مسابقه را وارد کن. به‌محض ذخیره، امتیاز همه خودکار حساب می‌شود.</div>
        <div class="filters"><button class="fchip ${FILTER.group==="all"?"on":""}" data-fg="all">همه</button>
        ${Object.keys(WC.GROUPS).map(g=>`<button class="fchip ${FILTER.group===g?"on":""}" data-fg="${g}">گروه ${g}</button>`).join("")}</div>`;
      WC.MATCHES.filter(m=>FILTER.group==="all"||m.group===FILTER.group).forEach(m=>html+=resultCard(m));
    } else if(av==="champion"){
      const cur=S.champion;
      html+=`<div class="panel"><h3>ثبت قهرمان جام</h3>
        <p class="sub">در پایان جام، تیم قهرمان را اینجا انتخاب کن تا امتیاز پیش‌بینی‌کنندگانِ درست خودکار اضافه شود.</p>
        <div class="champgrid">
          ${WC.CHAMP_TEAMS.map(tid=>{const t=WC.TEAMS[tid];return `<button class="champ-team ${cur===tid?"sel":""}" data-act="set-champ" data-team="${tid}"><span class="flag">${t.f}</span><span class="cname">${esc(t.n)}</span>${cur===tid?`<span class="pick-badge">قهرمان فعلی</span>`:""}</button>`;}).join("")}
        </div>
        ${cur?`<div class="cardfoot" style="margin-top:14px"><button class="btn ghost" data-act="clear-champ">✕ پاک‌کردن قهرمان</button></div>`:""}
      </div>`;
    } else if(av==="scoring"){
      const c=S.cfg;
      html+=`<div class="panel"><h3>تنظیم وزن امتیازها</h3>
        <p class="sub">قوانین امتیازدهی برای همهٔ گروه مشترک است.</p>
        <div class="cfg-grid">
          <div><label>برد/مساوی/باخت درست</label><input id="c-pOutcome" type="number" value="${c.pOutcome}"/></div>
          <div><label>تعداد گل یک تیم درست</label><input id="c-pOneTeam" type="number" value="${c.pOneTeam}"/></div>
          <div><label>نتیجهٔ کاملاً دقیق</label><input id="c-pExact" type="number" value="${c.pExact}"/></div>
          <div><label>هر گلزن درست</label><input id="c-pScorer" type="number" value="${c.pScorer}"/></div>
          <div><label>قهرمان جام درست</label><input id="c-pChampion" type="number" value="${c.pChampion}"/></div>
        </div>
        <div class="cardfoot"><button class="btn primary" data-act="save-cfg">💾 ذخیرهٔ تنظیمات</button></div></div>`;
    } else {
      html+=`<div class="panel"><h3>کاربران بازی</h3><p class="sub">می‌توانی نقش مدیر را به دیگری بدهی، یا رمز کسی را که گیر کرده ریست کنی.</p>`;
      S.users.forEach(u=>{
        html+=`<div class="rule"><div class="ic">👤</div>
          <div><b>${esc(u.name)}</b><p>${u.id===S.admin?"مدیر فعلی":"کاربر"}</p></div>
          <div style="margin-inline-start:auto;display:flex;gap:8px;flex-wrap:wrap">
            ${u.id!==ME?`<button class="btn ghost" data-act="reset-pw" data-uid="${u.id}">🔁 ریست رمز</button>`:""}
            ${u.id!==S.admin?`<button class="btn ghost" data-act="make-admin" data-uid="${u.id}">🛡️ مدیر کن</button>`:""}
          </div></div>`;
      });
      html+=`</div>`;
    }
    return html+`</div>`;
  }
  function resultCard(m){
    const T=WC.TEAMS, hm=T[m.home], am=T[m.away], res=S.results[m.id];
    const players=[...(hm.p||[]),...(am.p||[])]; ACLISTS[m.id]=players;
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
        <div class="ac-wrap">
          <input class="txt-in" id="rs-${m.id}" data-ac="${m.id}" data-ac-multi="1" autocomplete="off" value="${res&&res.s?esc(res.s.join("، ")):""}" placeholder="مثلاً: Vinícius Júnior، Raphinha"/>
          <div class="ac-list" id="acl-rs-${m.id}"></div>
        </div>
      </div>
      <div class="cardfoot"><button class="btn primary" data-act="save-result" data-mid="${m.id}">💾 ثبت نتیجه</button></div>
    </div>`;
  }

  // ============================================================ events
  function bindGlobal(){
    $app.querySelectorAll("[data-tab]").forEach(b=>b.onclick=async()=>{ TAB=b.dataset.tab; try{await getState();}catch{} renderView(); updateTabs(); });
    const rf=$app.querySelector('[data-act="refresh"]'); if(rf) rf.onclick=async()=>{ try{await getState(); renderView(); toast("به‌روزرسانی شد");}catch(e){toast(e.message,true);} };
    const cp=$app.querySelector('[data-act="chpw"]'); if(cp) cp.onclick=()=>{ showChangePwModal(); };
    const lo=$app.querySelector('[data-act="logout"]'); if(lo) lo.onclick=()=>{ logout(); };
  }
  function updateTabs(){ $app.querySelectorAll("[data-tab]").forEach(b=>b.classList.toggle("active", b.dataset.tab===TAB)); }

  function bindView(){
    const v=document.getElementById("view");
    bindAutocompleteOnce();
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
        pExact:+document.getElementById("c-pExact").value, pScorer:+document.getElementById("c-pScorer").value,
        pChampion:+document.getElementById("c-pChampion").value };
      try{ await post("/api/config",{ cfg }); await getState(); toast("تنظیمات ذخیره شد"); renderView(); }catch(e){ toast(e.message,true); }
    };

    v.querySelectorAll('[data-act="set-champ"]').forEach(b=>b.onclick=async()=>{
      try{ await post("/api/admin/champion",{ team:b.dataset.team }); await getState(); toast("قهرمان جام ثبت شد"); renderView(); }
      catch(e){ toast(e.message,true); }
    });
    const cc=v.querySelector('[data-act="clear-champ"]'); if(cc) cc.onclick=async()=>{
      try{ await post("/api/admin/champion",{ team:"" }); await getState(); toast("قهرمان پاک شد"); renderView(); }catch(e){ toast(e.message,true); }
    };

    v.querySelectorAll('[data-act="pick-champ"]').forEach(b=>b.onclick=async()=>{
      try{ await post("/api/champion",{ team:b.dataset.team }); await getState(); toast("قهرمانِ انتخابی‌ات ثبت شد"); renderView(); }
      catch(e){ toast(e.message,true); }
    });

    v.querySelectorAll('[data-act="make-admin"]').forEach(b=>b.onclick=async()=>{
      try{ await post("/api/admin/transfer",{ target:b.dataset.uid }); await getState(); toast("مدیر تغییر کرد"); render(); }catch(e){ toast(e.message,true); }
    });

    v.querySelectorAll('[data-act="reset-pw"]').forEach(b=>b.onclick=async()=>{
      try{ const d=await post("/api/admin/reset-password",{ target:b.dataset.uid }); showTempPwModal(d.name, d.tempPassword); }
      catch(e){ toast(e.message,true); }
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
