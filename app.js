/* Program Gym: merender data/*.json (angka) dan *.md (aturan & penjelasan).
   Minggu sekarang dihitung dari tanggal mulai tiap siklus di data/cycles.json.
   Tambahkan ?today=YYYY-MM-DD di URL untuk melihat tampilan di tanggal lain. */

const SRC = {
  program: "data/program.json", cycles: "data/cycles.json", body: "data/body.json",
  "md:program": "program.md", "md:decisions": "decisions.md", "md:body": "body.md",
};
const TAB_NAMES = {home:"Ringkas", cycles:"Siklus", program:"Program", decisions:"Keputusan", body:"Tubuh"};
const MD_TAB = {"program.md":"program", "decisions.md":"decisions", "body.md":"body"};
const LIFT = {S:"var(--squat)", B:"var(--bench)", D:"var(--dead)"};
const LIFT_NAME = {S:"Squat", B:"Bench", D:"Deadlift"};
const DAYS = ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"];
const BLN = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const view = document.getElementById("view");
const cache = {};

/* ---------- util ---------- */
function esc(s){ return String(s ?? "").replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
function fmt(n){ return String(Math.round(n*10)/10).replace(".", ","); }
function kg(n){ return n == null ? "" : fmt(n) + " kg"; }
function d3(day){ return day.slice(0,3); }
function parseDate(s){ const [y,m,d] = s.split("-").map(Number); return new Date(y, m-1, d); }
function addDays(d, n){ const x = new Date(d); x.setDate(x.getDate()+n); return x; }
function fdate(d, year){ return d.getDate() + " " + BLN[d.getMonth()] + (year ? " " + d.getFullYear() : ""); }
function frange(a, b){ return a.getMonth() === b.getMonth() ? `${a.getDate()}–${fdate(b)}` : `${fdate(a)} – ${fdate(b)}`; }
function today(){
  const q = new URLSearchParams(location.search).get("today");
  const d = q && /^\d{4}-\d{2}-\d{2}$/.test(q) ? parseDate(q) : new Date();
  d.setHours(0,0,0,0); return d;
}

async function load(key){
  if (cache[key] !== undefined) return cache[key];
  try{
    const r = await fetch(SRC[key] + "?t=" + Date.now(), {cache:"no-store"});
    cache[key] = r.ok ? (key.startsWith("md:") ? await r.text() : await r.json()) : null;
  }catch(e){ console.error(SRC[key], e); cache[key] = null; }
  return cache[key];
}

/* ---------- model ---------- */
// Siklus diurutkan, tiap minggu diberi tanggal, nomor global (g), nomor di siklus (i), dan urutan minggu build (b dari nb).
function timeline(C){
  const cycles = [...((C && C.cycles) || [])].sort((a,b)=>a.start < b.start ? -1 : 1);
  let g = 0;
  return cycles.map((c, ci)=>{
    const s = parseDate(c.start);
    const weeks = (c.weeks || []).map((w, j)=>({...w, i:j+1, g:++g, start:addDays(s, 7*j), end:addDays(s, 7*j+6)}));
    const builds = weeks.filter(w=>w.type === "build");
    weeks.forEach(w=>{ w.b = builds.indexOf(w) + 1; w.nb = builds.length; });
    return {...c, n:ci+1, weeks, startD:s, end: weeks.length ? weeks[weeks.length-1].end : s};
  });
}
function locate(tl, t){
  for (const c of tl) for (const w of c.weeks) if (t >= w.start && t <= w.end) return {state:"in", cycle:c, week:w, next:tl[c.n] || null};
  const next = tl.find(c=>c.startD > t), prev = [...tl].reverse().find(c=>c.end < t);
  if (!prev) return {state:"before", next};
  return {state: next ? "gap" : "after", prev, next};
}
function version(P, id){ return P.versions.find(v=>v.id === id) || P.versions.find(v=>v.id === P.default) || P.versions[0]; }
function exMap(v){ const m = {}; v.days.forEach(d=>d.ex.forEach(e=>{ m[e.id] = {...e, day:d.day}; })); return m; }
function findEx(P, v, id){ return exMap(v)[id] || P.versions.map(exMap).find(m=>m[id])?.[id] || {id, name:id, day:""}; }
function weekTitle(w){ return w.type === "deload" ? "Minggu deload" : w.type === "test" ? "Minggu tes" : `Minggu ${w.b} dari ${w.nb}`; }
function weekShort(w){ return w.type === "deload" ? "Deload" : w.type === "test" ? "Tes" : "Mg " + w.g; }
function result(l){
  if (!l || !l.result) return "";
  return l.result === "ok" ? `<span class="res ok" title="tuntas">✓</span>` : `<span class="res" title="rep per set">${esc(l.result)}</span>`;
}
// Beban satu latihan: minggu ini (semua versi) → beban tetap siklus (versi siklus saja) → beban awal template.
function resolve(e, v, cycle, week){
  const wl = week && week.loads && week.loads[e.id];
  if (wl) return {text:kg(wl.kg), sets:wl.sets, note:wl.note, l:wl, src:"week"};
  // lift dengan beban mingguan yang belum ditulis minggu ini: jangan jatuh ke beban awal template
  const prev = cycle && week ? cycle.weeks.filter(x=>x.i < week.i && x.loads && x.loads[e.id]).pop() : null;
  if (prev) return {text: week.type === "deload" ? "Deload" : "Belum ditulis", note:`${weekShort(prev).toLowerCase()}: ${kg(prev.loads[e.id].kg)}`, src:"week"};
  const cl = cycle && cycle.version === v.id && cycle.loads && cycle.loads[e.id];
  if (cl) return {text:cl.load, sets:cl.target, as:cl.as, src:"cycle"};
  return {text:e.start, src:"start"};
}
// id lift utama yang punya beban mingguan di siklus, urut sesuai hari di template.
function weekCols(P, c){
  const ids = new Set(); c.weeks.forEach(w=>Object.keys(w.loads || {}).forEach(id=>ids.add(id)));
  const v = version(P, c.version), order = [];
  v.days.forEach(d=>d.ex.forEach(e=>{ if (ids.has(e.id)) { order.push(e.id); ids.delete(e.id); } }));
  return order.concat([...ids]).map(id=>findEx(P, v, id));
}

/* ---------- blok ---------- */
function loadsBlock(P, v, w){
  const cols = Object.keys(w.loads || {}).map(id=>findEx(P, v, id));
  if (!cols.length) return `<p class="callout">Beban minggu ini belum ditulis di <code>data/cycles.json</code>.</p>`;
  const dayIdx = e=>DAYS.indexOf(e.day);
  cols.sort((a,b)=>dayIdx(a) - dayIdx(b));
  let h = `<div class="lifts">`, sub = "";
  for (const e of cols){
    const l = w.loads[e.id], sets = l.sets || e.sets;
    if (e.heavy) h += `<div class="lc" style="--c:${LIFT[e.lift] || "var(--ink)"}"><div class="l">${esc(LIFT_NAME[e.lift] || e.name)}${e.day ? " · " + d3(e.day) : ""}</div><div class="v">${fmt(l.kg)}<small>kg</small></div><div class="s">${esc(sets)}${result(l)}</div>${l.note ? `<small class="n">${esc(l.note)}</small>` : ""}</div>`;
    else sub += `<div><small>${esc(e.name)} ${esc(sets)}${e.day ? " (" + d3(e.day) + ")" : ""}</small><b>${kg(l.kg)}</b>${result(l)}${l.note ? `<small>${esc(l.note)}</small>` : ""}</div>`;
  }
  return h + `</div>` + (sub ? `<div class="sub">${sub}</div>` : "");
}

function e1rmBlock(C){
  const list = [...((C && C.e1rm) || [])].sort((a,b)=>a.date < b.date ? -1 : 1);
  if (!list.length) return "";
  const last = list[list.length-1], prev = list[list.length-2];
  let h = `<h2>Estimasi 1RM</h2><div class="lifts">`;
  for (const k of ["S","B","D"]){
    if (last[k] == null) continue;
    const vals = list.map(x=>x[k]).filter(x=>x != null);
    const d = prev && prev[k] != null ? last[k] - prev[k] : null;
    h += `<div class="lc" style="--c:${LIFT[k]}"><div class="l">${LIFT_NAME[k]}</div><div class="v">±${fmt(last[k])}<small>kg</small></div>`;
    h += d !== null ? `<div class="dl">${d > 0 ? "+" : d < 0 ? "−" : "±"}${fmt(Math.abs(d))} kg sejak ${fdate(parseDate(prev.date))}</div>` : "";
    h += vals.length > 1 ? spark(vals) : "";
    h += `</div>`;
  }
  const total = (last.S||0) + (last.B||0) + (last.D||0);
  return h + `</div><p class="lede">Total ±${fmt(total)} kg, dihitung ${fdate(parseDate(last.date), true)}. Rumus: beban × (1 + rep ÷ 30).</p>`;
}
function spark(vals){
  const lo = Math.min(...vals), hi = Math.max(...vals), span = hi - lo || 1;
  const pts = vals.map((v,i)=>[i / (vals.length-1) * 100, 26 - (v - lo) / span * 22]);
  const [lx, ly] = pts[pts.length-1];
  return `<svg class="spark" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts.map(p=>p.join(",")).join(" ")}"/><circle cx="${lx}" cy="${ly}" r="2.5"/></svg>`;
}

function bodyBlock(B, heading){
  if (!B) return "";
  const n = B.nutrition || {}, scans = (B.scans || []).filter(s=>s.standard);
  let h = heading ? `<h2>Tubuh & nutrisi</h2>` : "";
  const ph = B.phase, t = today();
  let phase = "";
  if (ph && ph.start){
    const m = Math.floor((t - parseDate(ph.start)) / 864e5 / 30.44) + 1;
    if (m >= 1 && m <= ph.months) phase = `<div><small>${esc(ph.name)}</small><b>Bulan ${m} dari ${ph.months}</b></div>`;
  }
  h += `<div class="sub">${phase}${n.kcal ? `<div><small>Kalori harian${n.since ? " sejak " + fdate(parseDate(n.since)) : ""}</small><b>${n.kcal} kkal</b></div>` : ""}${n.protein ? `<div><small>Protein</small><b>${esc(n.protein)}</b></div>` : ""}${B.next_scan ? `<div><small>Scan berikutnya</small><b>±${fdate(parseDate(B.next_scan))}</b></div>` : ""}</div>`;
  if (!scans.length) return h;
  const last = scans[scans.length-1], base = scans.find(s=>s.baseline) || scans[0];
  h += `<p class="lede">Scan standar terakhir ${fdate(parseDate(last.date), true)}${last !== base ? ", dibanding baseline " + fdate(parseDate(base.date)) : ""}.</p><div class="stats">`;
  for (const [lbl, key, u] of [["Berat","weight","kg"],["Lean mass","lean","kg"],["Body fat","bf","%"],["Perut","waist","cm"]]){
    const v = last[key], b = base[key], d = v != null && b != null && last !== base ? v - b : null;
    h += `<div class="st"><small>${lbl}</small><b>${v != null ? fmt(v) : "–"}${u === "%" ? "%" : " " + u}</b>${d !== null ? `<em>${d > 0 ? "+" : ""}${fmt(d)} ${u === "%" ? "poin" : u}</em>` : ""}</div>`;
  }
  h += `</div>`;
  if (last.waist && B.waist_brake && base.waist){
    const lo = base.waist - 2, pct = Math.min(100, Math.max(0, (last.waist - lo) / (B.waist_brake - lo) * 100));
    h += `<div class="meter"><div class="track"><div class="fill ${pct > 85 ? "stop" : pct > 60 ? "warn" : ""}" style="width:${pct}%"></div></div><div class="lbl"><span>Lingkar perut ${fmt(last.waist)} cm</span><span>Rem ${fmt(B.waist_brake)} cm</span></div></div>`;
  }
  return h;
}

function scanTable(B){
  const scans = (B && B.scans) || [];
  if (!scans.length) return "";
  const cols = [["Berat","weight"],["Lean","lean"],["Otot rangka","smm"],["Lemak","fat"],["BF%","bf"],["Perut","waist"],["TEE","tee"]];
  let h = `<div class="tw"><table><thead><tr><th>Tanggal</th><th>Kondisi</th>${cols.map(c=>`<th>${c[0]}</th>`).join("")}</tr></thead><tbody>`;
  for (const s of scans){
    h += `<tr class="${s.baseline ? "base" : s.standard ? "" : "muted"}"><td>${fdate(parseDate(s.date), true)}${s.time ? `<small>${esc(s.time)}</small>` : ""}</td><td>${esc(s.cond)}</td>${cols.map(([,k])=>`<td>${s[k] != null ? fmt(s[k]) : "–"}</td>`).join("")}</tr>`;
  }
  h += `</tbody></table></div>`;
  const notes = scans.filter(s=>s.note);
  if (notes.length) h += `<ul>${notes.map(s=>`<li><b>${fdate(parseDate(s.date))}:</b> ${esc(s.note)}</li>`).join("")}</ul>`;
  return h;
}

function cycleTable(P, c, cur){
  const cols = weekCols(P, c);
  let h = `<div class="tw"><table><thead><tr><th>Minggu</th>${cols.map(e=>`<th>${esc(LIFT_NAME[e.lift] || e.name)} ${esc(e.sets || "")}${e.day ? " (" + d3(e.day) + ")" : ""}</th>`).join("")}</tr></thead><tbody>`;
  for (const w of c.weeks){
    h += `<tr class="${w === cur ? "now" : ""}"><td>${esc(weekShort(w))}${w.type !== "build" ? ` <small>mg ${w.g}</small>` : ""}<small>${frange(w.start, w.end)}</small></td>`;
    if (!w.loads || !Object.keys(w.loads).length){ h += `<td class="off" colspan="${cols.length || 1}">${esc(w.note || "Belum ditulis")}</td></tr>`; continue; }
    for (const e of cols){
      const l = w.loads[e.id];
      h += l ? `<td>${kg(l.kg)}${l.sets ? " " + esc(l.sets) : ""}${result(l)}${l.note ? `<small>${esc(l.note)}</small>` : ""}</td>` : `<td class="off">–</td>`;
    }
    h += `</tr>`;
  }
  return h + `</tbody></table></div>`;
}
function cycleLoadsTable(P, c){
  const ids = Object.keys(c.loads || {});
  if (!ids.length) return "";
  const v = version(P, c.version), rows = ids.map(id=>({...findEx(P, v, id), ...c.loads[id]}));
  rows.sort((a,b)=>DAYS.indexOf(a.day) - DAYS.indexOf(b.day));
  return `<h3>Beban tetap selama siklus</h3><div class="tw"><table><thead><tr><th>Hari</th><th>Latihan</th><th>Beban</th><th>Target</th></tr></thead><tbody>${rows.map(r=>`<tr class="${r.main ? "lift" : ""}" style="${r.lift ? "--c:" + LIFT[r.lift] : ""}"><td>${esc(r.day ? d3(r.day) : "")}</td><td>${esc(r.as || r.name)}${r.as ? `<small>${esc(r.name)}</small>` : ""}</td><td>${esc(r.load)}</td><td>${esc(r.target || "")}</td></tr>`).join("")}</tbody></table></div>`;
}
function cycleBody(P, c, cur){
  const meta = `Mulai Senin, ${fdate(c.startD, true)} · Versi ${esc(c.version)} · ${c.weeks.length} minggu (minggu ke-${c.weeks[0]?.g ?? "?"}–${c.weeks[c.weeks.length-1]?.g ?? "?"})`;
  return `<p class="cyc-meta">${meta}</p>${cycleTable(P, c, cur)}${(c.notes || []).length ? `<ul>${c.notes.map(n=>`<li>${esc(n)}</li>`).join("")}</ul>` : ""}${cycleLoadsTable(P, c)}`;
}

/* ---------- Ringkas ---------- */
function renderHome(P, C, B){
  const tl = timeline(C), t = today(), loc = locate(tl, t);
  const cur = loc.cycle, w = loc.week, ref = cur || loc.prev || loc.next;
  const ver = version(P, ref ? ref.version : P.default);
  let h = "";

  if (loc.state === "in"){
    h += `<p class="kicker">Siklus ${cur.n} · Minggu ke-${w.g} · ${frange(w.start, w.end)}</p><h1>${weekTitle(w)}</h1>`;
    const def = w.type === "deload" ? "Set dipotong, beban ringan. Semua lift utama harus terasa enteng." : "Target set terakhir lift utama: berat tapi aman.";
    h += `<p class="lede">${esc(w.note || def)} Menjalankan Versi ${esc(ver.id)} (${esc(ver.name)}).</p>`;
    const n = cur.weeks.length, grid = `style="grid-template-columns:repeat(${n},1fr)"`;
    h += `<div class="progress" ${grid}>${cur.weeks.map(x=>`<div class="${x.i < w.i ? "done" : x === w ? "cur" : ""}"></div>`).join("")}</div>`;
    h += `<div class="progress-l" ${grid}>${cur.weeks.map(x=>`<span class="${x === w ? "cur" : ""}">${weekShort(x)}</span>`).join("")}</div>`;
    h += `<h2>Beban minggu ini</h2>` + loadsBlock(P, ver, w);
    if (w.acc) h += `<p class="callout">${esc(w.acc)}</p>`;
    if (w.skip && w.skip.length) h += `<p class="lede">Libur minggu ini: ${w.skip.map(esc).join(", ")}.</p>`;
  } else if (loc.state === "before"){
    h += `<p class="kicker">Belum mulai</p><h1>Siklus 1 belum mulai</h1><p class="lede">Mulai Senin, ${fdate(loc.next.startD, true)}.</p>`;
  } else {
    h += `<p class="kicker">Setelah siklus ${loc.prev.n}</p><h1>${loc.next ? `Jeda sebelum siklus ${loc.next.n}` : `Siklus ${loc.prev.n} selesai`}</h1>`;
    h += `<p class="lede">${loc.next ? `Siklus ${loc.next.n} mulai Senin, ${fdate(loc.next.startD, true)}.` : `Siklus berikutnya belum ada di <code>data/cycles.json</code>. Kirim log minggu terakhir untuk menyusunnya.`}</p>`;
  }

  // pengingat hanya di minggu terakhir siklus terakhir; beban siklus berikutnya cukup dilihat di tab Siklus
  if (loc.state === "in" && w.i === cur.weeks.length && !loc.next){
    h += `<p class="callout">Siklus ${cur.n + 1} belum disusun. Kirim log minggu ke-${cur.weeks.filter(x=>x.type === "build").slice(-1)[0]?.g ?? ""} untuk menghitung bebannya.</p>`;
  }

  h += e1rmBlock(C);
  h += `<h2 id="jadwal">Jadwal seminggu</h2><div id="sched"></div>`;
  h += bodyBlock(B, true);
  h += `<p class="callout">Riwayat dan rencana siklus ada di tab Siklus.<br><button class="go" data-go="cycles">Buka siklus →</button></p>`;
  h += `<p class="foot">Dihitung dari data/cycles.json, data/program.json, dan data/body.json. Minggu sekarang dihitung dari tanggal mulai siklus.</p>`;
  view.innerHTML = h;
  view.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click", ()=>go(b.dataset.go)));
  SCHED.ctx = {P, ver, cur, w};
  renderSched();
}

/* ---------- jadwal seminggu ---------- */
const SCHED = {v:null, d:null, ctx:null};
function renderSched(){
  const box = document.getElementById("sched"); if (!box || !SCHED.ctx) return;
  const {P, ver, cur, w} = SCHED.ctx, t = today(), ti = (t.getDay() + 6) % 7;
  let saved = null; try{ saved = localStorage.getItem("gym-version"); }catch(e){}
  if (!SCHED.v || !P.versions.some(x=>x.id === SCHED.v)) SCHED.v = (P.versions.find(x=>x.id === saved) || ver).id;
  const v = version(P, SCHED.v), running = v.id === ver.id;
  const days = {}; v.days.forEach(d=>{ days[d.day] = d; });
  const skip = running && w && w.skip ? w.skip : [];
  const trains = d=>days[d] && !skip.includes(d);
  if (!SCHED.d || !days[SCHED.d]) for (let i = 0; i < 7; i++){ const d = DAYS[(ti + i) % 7]; if (trains(d)){ SCHED.d = d; break; } }
  const lifts = d=>[...new Set(d.ex.filter(e=>e.main && e.lift).map(e=>e.lift))];

  let h = "";
  if (P.versions.length > 1) h += `<div class="vsw" role="tablist" aria-label="Versi program">${P.versions.map(x=>`<button role="tab" data-v="${x.id}" aria-selected="${x.id === v.id}"><strong>Versi ${x.id}${x.id === ver.id ? " ✓" : ""}</strong><span>${esc(x.name)}</span></button>`).join("")}</div>`;
  h += `<div class="week" role="tablist" aria-label="Hari">`;
  DAYS.forEach((d, i)=>{
    const x = days[d], on = trains(d), date = w ? addDays(w.start, i).getDate() : null;
    const cls = (x ? "wd" : "wd off") + (on ? "" : " off") + (i === ti && w ? " today" : "") + (d === SCHED.d ? " sel" : "");
    const label = i === ti && w ? "Hari ini" : d3(d) + (date ? " " + date : "");
    const inner = `<span class="d">${label}</span><span class="n">${x ? esc(x.name) : "Libur"}</span>${x ? `<span class="dots">${lifts(x).map(k=>`<i class="dot" style="--c:${LIFT[k]}"></i>`).join("")}</span>` : ""}`;
    h += x ? `<button class="${cls}" role="tab" data-d="${d}" aria-selected="${d === SCHED.d}">${inner}</button>` : `<div class="${cls}">${inner}</div>`;
  });
  h += `</div><div class="legend">${["S","B","D"].map(k=>`<span><i class="dot" style="--c:${LIFT[k]}"></i>${LIFT_NAME[k]}</span>`).join("")}<span>· ketuk hari untuk detail</span></div>`;
  if (!running) h += `<p class="callout">Versi ${v.id} bukan versi yang sedang dijalankan. Beban lift utama minggu ini tetap ditampilkan; aksesori memakai beban awal.</p>`;
  const day = days[SCHED.d];
  if (day) h += `<div id="sess" class="card sess">${sessionCard(v, day, cur, w, skip.includes(day.day))}</div>`;
  box.innerHTML = h;
  box.querySelectorAll("[data-v]").forEach(b=>b.addEventListener("click", ()=>{ SCHED.v = b.dataset.v; SCHED.d = null; try{ localStorage.setItem("gym-version", SCHED.v); }catch(e){} renderSched(); }));
  box.querySelectorAll("[data-d]").forEach(b=>b.addEventListener("click", ()=>{ SCHED.d = b.dataset.d; renderSched(); document.getElementById("sess").scrollIntoView({behavior:"smooth", block:"nearest"}); }));
}
function sessionCard(v, day, cycle, week, skipped){
  let h = `<h3>${esc(day.day)}: ${esc(day.name)}</h3>${day.focus ? `<p class="focus">${esc(day.focus)}</p>` : ""}`;
  if (skipped) h += `<p class="callout">Libur minggu ini (${esc(weekShort(week).toLowerCase())}).</p>`;
  if (week && week.acc && !skipped) h += `<p class="callout">${esc(week.acc)}</p>`;
  const rows = day.ex.map(e=>({e, r:resolve(e, v, cycle, week)}));
  const upd = rows.some(x=>x.r.src !== "start");
  h += `<div class="tw"><table><thead><tr><th>Latihan</th><th>Set × Rep</th><th>Intensitas</th><th class="hm">Rest</th><th>${upd ? "Beban sekarang" : "Beban awal"}</th></tr></thead><tbody>`;
  for (const {e, r} of rows){
    const name = esc(r.as || e.name) + (e.opt ? " <small>opsional</small>" : "") + (r.as ? `<small>${esc(e.name)}</small>` : "") + (e.ss ? `<span class="tag ss">superset</span>` : "");
    h += `<tr class="${e.main ? "lift" : ""}" style="${e.lift && e.main ? "--c:" + LIFT[e.lift] : ""}"><td>${e.main ? `<strong>${name}</strong>` : name}</td><td>${esc(r.sets || e.sets)}</td><td>${esc(week && week.type === "deload" && e.main ? "enteng" : e.int || "")}</td><td class="hm">${esc(e.rest || "")}</td><td class="${r.src !== "start" ? "upd" : ""}">${esc(r.text)}${result(r.l)}${r.note ? `<small>${esc(r.note)}</small>` : ""}</td></tr>`;
  }
  h += `</tbody></table></div>`;
  if (day.note) h += `<p>${esc(day.note)}</p>`;
  return h;
}

/* ---------- tab Siklus ---------- */
const CYC = {n:null};
function renderCycles(P, C){
  const tl = timeline(C), loc = locate(tl, today());
  if (!tl.length){ view.innerHTML = `<h1>Siklus</h1><p class="callout">Belum ada siklus di <code>data/cycles.json</code>.</p>`; return; }
  const def = (loc.cycle || loc.next || loc.prev).n;
  if (!tl.some(c=>c.n === CYC.n)) CYC.n = def;
  const c = tl.find(x=>x.n === CYC.n), wk = c === loc.cycle ? loc.week : null;
  let h = `<h1>Siklus</h1><div class="chips" role="tablist" aria-label="Siklus">`;
  h += tl.map(x=>`<button role="tab" data-n="${x.n}" aria-selected="${x === c}"><strong>Siklus ${x.n}</strong><span>${x === loc.cycle ? "sekarang" : frange(x.startD, x.end)}</span></button>`).join("");
  h += `</div>` + cycleBody(P, c, wk);

  const e1 = [...((C && C.e1rm) || [])].sort((a,b)=>a.date < b.date ? 1 : -1);
  if (e1.length){
    h += `<h2>Riwayat estimasi 1RM</h2><div class="tw"><table><thead><tr><th>Tanggal</th><th>Squat</th><th>Bench</th><th>Deadlift</th><th>Total</th><th>Dari</th></tr></thead><tbody>`;
    h += e1.map(x=>`<tr><td>${fdate(parseDate(x.date), true)}</td><td>${kg(x.S)}</td><td>${kg(x.B)}</td><td>${kg(x.D)}</td><td>${kg((x.S||0)+(x.B||0)+(x.D||0))}</td><td><small>${esc(x.from || "")}</small></td></tr>`).join("");
    h += `</tbody></table></div>`;
  }
  view.innerHTML = h;
  view.querySelectorAll("[data-n]").forEach(b=>b.addEventListener("click", ()=>{ CYC.n = Number(b.dataset.n); renderCycles(P, C); foot("cycles"); }));
  view.querySelector('.chips [aria-selected="true"]')?.scrollIntoView({block:"nearest", inline:"center"});
}

/* ---------- tab Program ---------- */
function renderProgram(P, C, md){
  const loc = locate(timeline(C), today());
  const ver = version(P, (loc.cycle || loc.prev || loc.next || {}).version);
  let h = `<h1>Program</h1>`;
    for (const v of [ver, ...P.versions.filter(x=>x !== ver)]){
    const body = `<p class="cyc-meta">${esc(v.freq || "")}</p>${(v.notes || []).length ? `<ul>${v.notes.map(n=>`<li>${esc(n)}</li>`).join("")}</ul>` : ""}${v.days.map(d=>`<article class="card">${sessionCard(v, d, null, null, false)}</article>`).join("")}`;
    h += v === ver
      ? `<h3 style="font-size:1.6rem;margin-top:8px">Versi ${v.id}: ${esc(v.name)} <span class="tag run">dijalankan</span></h3>${body}`
      : `<details class="alt"><summary><h2>Versi ${v.id}: ${esc(v.name)}</h2></summary>${body}</details>`;
  }
  h += `<div id="md"></div>`;
  view.innerHTML = h;
  if (md){
    const box = document.getElementById("md");
    box.innerHTML = marked.parse(md);
    box.querySelector("h1")?.remove();
    decorate(box);
  }
}

/* ---------- tab markdown ---------- */
function decorate(root){
  root.querySelectorAll("table").forEach(t=>{ const w = document.createElement("div"); w.className = "tw"; t.parentNode.insertBefore(w, t); w.appendChild(t); });
  root.querySelectorAll("a[href]").forEach(a=>{
    const k = MD_TAB[a.getAttribute("href")];
    if (k) a.addEventListener("click", e=>{ e.preventDefault(); go(k); });
  });
}
function renderBody(B, md){
  view.innerHTML = md ? marked.parse(md) : `<h1>Tubuh</h1>`;
  decorate(view);
  const top = document.createElement("div"); top.innerHTML = bodyBlock(B, false);
  const h1 = view.querySelector("h1"); h1 ? h1.after(top) : view.prepend(top);
  const scan = [...view.querySelectorAll("h2")].find(x=>/riwayat scan/i.test(x.textContent));
  const tbl = document.createElement("div"); tbl.innerHTML = scanTable(B);
  if (scan){ const p = scan.nextElementSibling; scan.after(tbl); if (p && p.tagName === "P") tbl.after(p); }
  else view.appendChild(tbl);
}

/* ---------- navigasi ---------- */
async function show(key){
  document.querySelectorAll("nav button").forEach(b=>b.setAttribute("aria-selected", String(b.dataset.f === key)));
  view.innerHTML = '<p class="msg">Memuat…</p>';
  document.title = "Program Gym · " + TAB_NAMES[key];
  try{
    if (key === "home" || key === "cycles" || key === "program"){
      const [P, C, B, md] = await Promise.all([load("program"), load("cycles"), key === "home" ? load("body") : null, key === "program" ? load("md:program") : null]);
      if (!P || !C){ view.innerHTML = '<p class="msg">data/program.json atau data/cycles.json tidak terbaca. Cek format JSON-nya.</p>'; return; }
      key === "home" ? renderHome(P, C, B) : key === "cycles" ? renderCycles(P, C) : renderProgram(P, C, md);
    } else if (key === "body"){
      const [B, md] = await Promise.all([load("body"), load("md:body")]);
      renderBody(B, md);
    } else {
      const md = await load("md:" + key);
      view.innerHTML = md ? marked.parse(md) : `<p class="msg">${SRC["md:" + key]} belum ada di repo.</p>`;
      decorate(view);
    }
  }catch(e){ console.error(e); view.innerHTML = '<p class="msg">Halaman gagal dirender. Buka console untuk detail.</p>'; return; }
  foot(key);
}
function foot(key){
  if (key === "home") return;
  const f = document.createElement("p"); f.className = "foot";
  f.textContent = "Angka dari folder data/, penjelasan dari file .md. Edit lalu push untuk memperbarui halaman ini.";
  view.appendChild(f);
}
function go(key){
  if (location.hash !== "#" + key) history.replaceState(null, "", location.search + "#" + key);
  show(key); window.scrollTo(0, 0);
}
document.querySelectorAll("nav button").forEach(b=>b.addEventListener("click", ()=>go(b.dataset.f)));
const start = location.hash.slice(1);
show(TAB_NAMES[start] ? start : "home");
