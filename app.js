/* WDT Site Survey – offline survey app for WDT Alarms Ltd.
   Everything is stored on the phone (IndexedDB). No server, no account. */
'use strict';

/* ---------------- Checklist definitions ---------------- */
// type: text | area | sel | yn | num | date
const YN = ['Yes', 'No', 'N/A'];

const SITE = [
  { k: 'ref', l: 'Job / quote number', t: 'text', h: 'e.g. 1862' },
  { k: 'date', l: 'Survey date', t: 'date' },
  { k: 'company', l: 'Client / company name', t: 'text' },
  { k: 'contact', l: 'Contact name & role', t: 'text' },
  { k: 'phone', l: 'Phone', t: 'tel' },
  { k: 'email', l: 'Email', t: 'email' },
  { k: 'address', l: 'Site address & postcode', t: 'area' },
  { k: 'billing', l: 'Billing address (if different)', t: 'area' },
  { k: 'decision', l: 'Who signs off / pays?', t: 'text' },
  { k: 'premises', l: 'Type of premises & use', t: 'text', h: 'e.g. office, warehouse, pub with flat above' },
  { k: 'floors', l: 'Floors / approx size', t: 'text' },
  { k: 'hours', l: 'Site hours / when can we work?', t: 'text' },
  { k: 'access', l: 'Access, parking & keys', t: 'text' },
  { k: 'insurer', l: 'Insurer requirements', t: 'area', h: 'Ask for the insurer letter / survey if there is one' },
  { k: 'existing', l: 'Existing system(s) on site', t: 'area', h: 'Make, age, condition, remove / reuse / take over' },
  { k: 'asbestos', l: 'Asbestos register seen?', t: 'sel', o: ['Yes – seen', 'No – not available', 'N/A – post-2000 building'] },
  { k: 'height', l: 'Working at height', t: 'sel', o: ['Ladder', 'Podium / tower', 'MEWP / cherry picker', 'Not needed'] },
  { k: 'timescale', l: 'Client timescale', t: 'text' },
  { k: 'budget', l: 'Budget mentioned?', t: 'text' }
];

const SYSTEMS = {
  fire: {
    name: 'Fire alarm', short: 'Fire', std: 'BS 5839-1 (commercial). Wireless devices to BS EN 54-25.',
    items: [
      { k: 'cat', l: 'Category required', t: 'sel', o: ['L1', 'L2', 'L3', 'L4', 'L5', 'M', 'P1', 'P2', 'Not yet known'] },
      { k: 'catSource', l: 'Where does the Category come from?', t: 'sel', o: ['Fire risk assessment', 'Insurer', 'Client choice', 'Fire service / enforcing authority', 'WDT recommendation'] },
      { k: 'fra', l: 'Fire risk assessment seen?', t: 'yn', h: 'Note date and who wrote it' },
      { k: 'fraNotes', l: 'FRA notes', t: 'area' },
      { k: 'sleeping', l: 'Anyone sleeps on the premises?', t: 'yn' },
      { k: 'ceilings', l: 'Ceiling heights & types (general)', t: 'area', h: 'Record any voids, high ceilings or atria' },
      { k: 'wired', l: 'Wired or wireless?', t: 'sel', o: ['Wireless', 'Wired', 'Hybrid'] },
      { k: 'radio', l: 'Radio site survey done? (wireless)', t: 'yn' },
      { k: 'radioNotes', l: 'Radio survey readings / problem areas', t: 'area' },
      { k: 'panel', l: 'Panel location', t: 'text', h: 'Near main entrance / fire service access point' },
      { k: 'mains', l: 'Mains supply point & distance', t: 'text', h: 'Dedicated fused spur – FP200 run length' },
      { k: 'zonePlan', l: 'Zone plan location agreed?', t: 'yn' },
      { k: 'exits', l: 'Final exits & escape routes covered?', t: 'yn', h: 'Call points on exits / storey exits – mark in rooms' },
      { k: 'audibility', l: 'Noisy areas / sound levels', t: 'area', h: '65 dB(A) general, 75 dB(A) at bedhead where sleeping' },
      { k: 'vads', l: 'VADs (beacons) needed?', t: 'yn', h: 'Hearing-impaired staff/visitors, noisy areas, toilets' },
      { k: 'cause', l: 'Cause & effect / interfaces', t: 'area', h: 'Door holders, access control release, gas/plant shutdown, lifts, smoke vents' },
      { k: 'monitor', l: 'Remote monitoring / ARC wanted?', t: 'yn' },
      { k: 'compart', l: 'Fire doors / compartments / voids notes', t: 'area' },
      { k: 'rp', l: 'Responsible person (fire safety)', t: 'text' }
    ],
    chips: ['Smoke detector', 'Heat detector', 'Multi-sensor', 'Call point', 'Sounder', 'Sounder/VAD', 'VAD', 'Beam detector', 'Door holder', 'Input/output unit']
  },
  intruder: {
    name: 'Intruder alarm', short: 'Intruder', std: 'BS EN 50131 / PD 6662. Police response: BS 8243 confirmation.',
    items: [
      { k: 'grade', l: 'Security grade', t: 'sel', o: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4'] },
      { k: 'gradeWhy', l: 'Why that grade? (risk assessment)', t: 'area', h: 'Premises type, contents, attractive items, insurer, previous break-ins' },
      { k: 'env', l: 'Environmental class', t: 'sel', o: ['I – Indoor heated', 'II – Indoor general', 'III – Outdoor sheltered', 'IV – Outdoor general'] },
      { k: 'police', l: 'Police response required?', t: 'yn' },
      { k: 'confirm', l: 'Confirmation method (BS 8243)', t: 'sel', o: ['Sequential', 'Audio', 'Visual', 'Not required'] },
      { k: 'ats', l: 'Notification / signalling', t: 'sel', o: ['Bells only', 'Speech dialler / app', 'SP2', 'DP2', 'DP3', 'DP4', 'Per insurer'] },
      { k: 'arc', l: 'ARC monitoring wanted?', t: 'yn' },
      { k: 'keyholders', l: 'Keyholders (how many / keyholding company?)', t: 'text' },
      { k: 'entry', l: 'Entry/exit route & times', t: 'text' },
      { k: 'set', l: 'Set / unset method', t: 'sel', o: ['Keypad', 'Prox fob', 'App', 'Keyswitch', 'Mixed'] },
      { k: 'partset', l: 'Part-set areas / groups', t: 'area' },
      { k: 'hua', l: 'Hold-up alarms needed?', t: 'yn' },
      { k: 'wired', l: 'Wired, wireless or hybrid?', t: 'sel', o: ['Wireless', 'Wired', 'Hybrid'] },
      { k: 'panel', l: 'Panel location & mains supply', t: 'text' },
      { k: 'ext', l: 'External sounder location', t: 'text' },
      { k: 'risks', l: 'False alarm risks', t: 'area', h: 'Pets, heaters, draughts, stock moving, high racking' }
    ],
    chips: ['PIR', 'Dual-tech', 'Pet-tolerant PIR', 'Door contact', 'Shock sensor', 'Glass break', 'Curtain detector', 'Keypad', 'Hold-up button', 'Internal sounder', 'External sounder']
  },
  cctv: {
    name: 'CCTV', short: 'CCTV', std: 'BS EN 62676-4 operational requirement. UK GDPR / data protection.',
    items: [
      { k: 'purpose', l: 'Overall purpose / operational requirement', t: 'area', h: 'What problem is it solving? Theft, safety, deterrence, evidence' },
      { k: 'lighting', l: 'Lighting at night', t: 'area', h: 'Street lights, PIR floods, total dark – IR / colour cameras' },
      { k: 'retention', l: 'Recording retention (days)', t: 'num' },
      { k: 'recorder', l: 'Recorder (NVR) location', t: 'text' },
      { k: 'network', l: 'Internet / router access', t: 'text', h: 'Who manages the router? Spare port? Wi-Fi only?' },
      { k: 'remote', l: 'Remote viewing on phones?', t: 'yn' },
      { k: 'users', l: 'Who needs to view / how many users', t: 'text' },
      { k: 'monitor', l: 'Monitor on site?', t: 'yn' },
      { k: 'audio', l: 'Audio recording asked for?', t: 'yn', h: 'Generally advise against – data protection' },
      { k: 'gdpr', l: 'Data protection: signage & controller', t: 'area', h: 'Signs needed, neighbours’ property/public areas in view' },
      { k: 'power', l: 'Power / PoE / cable routes', t: 'area' },
      { k: 'mount', l: 'Mounting heights & access', t: 'text' }
    ],
    chips: ['Dome camera', 'Turret camera', 'Bullet camera', 'PTZ camera', 'ANPR camera', 'Pole / bracket', 'Junction box']
  },
  access: {
    name: 'Access control', short: 'Access', std: 'BS EN 60839-11-1. Fire exits: fail-safe + green break glass.',
    items: [
      { k: 'doors', l: 'Number of controlled doors', t: 'num' },
      { k: 'cred', l: 'Credential type', t: 'sel', o: ['Fob', 'Card', 'PIN', 'Mobile', 'Mixed', 'Biometric'] },
      { k: 'users', l: 'Number of users', t: 'num' },
      { k: 'mgmt', l: 'Standalone, networked or cloud?', t: 'sel', o: ['Standalone', 'Networked (PC software)', 'Cloud / app'] },
      { k: 'admin', l: 'Who will add/remove users?', t: 'text' },
      { k: 'schedules', l: 'Time schedules / unlocked periods', t: 'area' },
      { k: 'fire', l: 'Release on fire alarm needed?', t: 'yn' },
      { k: 'fireExits', l: 'Any controlled doors on escape routes?', t: 'yn', h: 'Fail-safe lock + green break glass + fire alarm release' },
      { k: 'intercom', l: 'Intercom / visitor entry?', t: 'yn' },
      { k: 'power', l: 'Power supply locations', t: 'text' },
      { k: 'network', l: 'Network / internet available?', t: 'text' }
    ],
    chips: ['Reader', 'Keypad', 'Maglock', 'Electric strike', 'Exit button', 'Green break glass', 'Door contact', 'Door closer', 'Intercom', 'PSU']
  }
};
const SYS_KEYS = Object.keys(SYSTEMS);
const CCTV_LEVELS = ['Observe', 'Detect', 'Recognise', 'Identify'];

/* ---------------- Storage (IndexedDB) ---------------- */
let dbp;
function db() {
  if (!dbp) dbp = new Promise((res, rej) => {
    const r = indexedDB.open('wdt-survey', 1);
    r.onupgradeneeded = () => {
      const d = r.result;
      d.createObjectStore('jobs', { keyPath: 'id' });
      d.createObjectStore('photos', { keyPath: 'id' }).createIndex('jobId', 'jobId');
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  return dbp;
}
async function tx(store, mode, fn) {
  const d = await db();
  return new Promise((res, rej) => {
    const t = d.transaction(store, mode);
    const s = t.objectStore(store);
    let out;
    Promise.resolve(fn(s)).then(v => { out = v; });
    t.oncomplete = () => res(out);
    t.onerror = () => rej(t.error);
  });
}
const req = r => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
const getAllJobs = () => tx('jobs', 'readonly', s => req(s.getAll()));
const getJob = id => tx('jobs', 'readonly', s => req(s.get(id)));
const putJob = j => tx('jobs', 'readwrite', s => s.put(j));
const delJobDB = id => tx('jobs', 'readwrite', s => s.delete(id));
const putPhoto = p => tx('photos', 'readwrite', s => s.put(p));
const getPhoto = id => tx('photos', 'readonly', s => req(s.get(id)));
const delPhotoDB = id => tx('photos', 'readwrite', s => s.delete(id));
const jobPhotos = jobId => tx('photos', 'readonly', s => req(s.index('jobId').getAll(jobId)));
const allPhotos = () => tx('photos', 'readonly', s => req(s.getAll()));

/* ---------------- Helpers ---------------- */
const $ = s => document.querySelector(s);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => new Date().toISOString().slice(0, 10);
const ukDate = d => d ? d.split('-').reverse().join('/') : '';
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2200);
}
const urls = new Map();
function photoURL(p) {
  if (!urls.has(p.id)) urls.set(p.id, URL.createObjectURL(p.blob));
  return urls.get(p.id);
}

function newJob() {
  return {
    id: uid(), created: Date.now(), updated: Date.now(), status: 'Surveying',
    systems: [], details: { date: today() }, cl: {}, rooms: [], variations: [], notes: '', photoOrder: []
  };
}
function jobTitle(j) {
  const d = j.details || {};
  const name = d.company || d.address?.split('\n')[0] || 'New survey';
  return (d.ref ? d.ref + ' – ' : '') + name;
}

/* ---------------- State ---------------- */
let job = null;      // job currently open
let photos = [];     // photos of open job
let saveT = null;
function save() {
  if (!job) return;
  job.updated = Date.now();
  clearTimeout(saveT);
  saveT = setTimeout(() => putJob(job).catch(e => toast('Save failed: ' + e.message)), 300);
}
function flush() { if (job && saveT) { clearTimeout(saveT); saveT = null; putJob(job); } }
document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });

// Path binding: "details.x" | "cl.fire.x" | "room.ID.x" | "var.ID.x" | "notes" | "status"
function target(path) {
  const p = path.split('.');
  if (p[0] === 'details') return [job.details, p[1]];
  if (p[0] === 'cl') { job.cl[p[1]] = job.cl[p[1]] || {}; return [job.cl[p[1]], p[2]]; }
  if (p[0] === 'room') return [job.rooms.find(r => r.id === p[1]), p[2]];
  if (p[0] === 'var') return [job.variations.find(v => v.id === p[1]), p[2]];
  return [job, p[0]];
}
const getV = path => { const [o, k] = target(path); return o ? o[k] : ''; };
function setV(path, v) { const [o, k] = target(path); if (o) { o[k] = v; save(); } }

/* ---------------- Field rendering ---------------- */
function field(f, path) {
  const v = getV(path) ?? '';
  const hint = f.h ? `<span class="hint">${esc(f.h)}</span>` : '';
  const lab = `<label class="f">${esc(f.l)}${hint}`;
  switch (f.t) {
    case 'area': return `${lab}<textarea data-b="${path}">${esc(v)}</textarea></label>`;
    case 'sel': {
      if (f.o.length <= 4) return segs(lab, path, f.o, v);
      return `${lab}<select data-b="${path}"><option value="">—</option>${f.o.map(o => `<option${o === v ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></label>`;
    }
    case 'yn': return segs(lab, path, YN, v);
    case 'num': return `${lab}<input type="number" inputmode="numeric" data-b="${path}" value="${esc(v)}"></label>`;
    case 'date': return `${lab}<input type="date" data-b="${path}" value="${esc(v)}"></label>`;
    case 'tel': return `${lab}<input type="tel" data-b="${path}" value="${esc(v)}"></label>`;
    case 'email': return `${lab}<input type="email" data-b="${path}" value="${esc(v)}"></label>`;
    default: return `${lab}<input type="text" data-b="${path}" value="${esc(v)}"></label>`;
  }
}
function segs(lab, path, opts, v) {
  return `${lab}</label><div class="seg">${opts.map(o => `<button type="button" data-set="${path}" data-v="${esc(o)}" class="${o === v ? 'on' : ''}">${esc(o)}</button>`).join('')}</div>`;
}
function filled(items, obj) { obj = obj || {}; return items.filter(i => String(obj[i.k] ?? '').trim() !== '').length; }

/* ---------------- Views ---------------- */
const app = $('#app');

async function viewHome() {
  flush(); job = null; photos = [];
  const jobs = (await getAllJobs()).sort((a, b) => b.updated - a.updated);
  app.innerHTML = `
    <header class="top"><h1>WDT Site Survey</h1><button data-act="menu">Backup</button></header>
    <main>
      ${jobs.length ? `<div class="list">${jobs.map(j => `
        <a class="item card" href="#/job/${j.id}/site">
          <div class="t">${esc(jobTitle(j))}</div>
          <div class="s">${esc(ukDate(j.details?.date))}${j.details?.address ? ' · ' + esc(j.details.address.split('\n').pop()) : ''}</div>
          <div>${j.systems.map(s => `<span class="pill">${SYSTEMS[s].short}</span>`).join('')}
          <span class="pill ${j.status === 'Ready to quote' ? 'ok' : j.status === 'Quoted' ? '' : 'warn'}">${esc(j.status)}</span></div>
        </a>`).join('')}</div>`
      : `<div class="empty card"><p><b>No surveys yet.</b></p><p>Tap <b>New survey</b> to start. Everything is saved on this phone and works with no signal.</p></div>`}
      <p class="small muted" style="text-align:center">Back up regularly (top right) – surveys live only on this phone.</p>
    </main>
    <button class="fab" data-act="newjob">＋ New survey</button>`;
}

function tabs(active) {
  const t = [['site', 'Site', `${filled(SITE, job.details)}/${SITE.length}`]];
  job.systems.forEach(s => t.push([s, SYSTEMS[s].short, `${filled(SYSTEMS[s].items, job.cl[s])}/${SYSTEMS[s].items.length}`]));
  t.push(['rooms', 'Rooms', job.rooms.length], ['var', 'Variations', job.variations.length], ['photos', 'Photos', photos.length], ['send', 'Send', '']);
  return `<nav class="tabs">${t.map(([k, l, n]) => `<a href="#/job/${job.id}/${k}" class="${k === active ? 'on' : ''}">${l}${n !== '' ? `<span class="n">${n}</span>` : ''}</a>`).join('')}</nav>`;
}
function head(back, title) {
  return `<header class="top"><button data-go="${back}">‹ Back</button><h1>${esc(title)}</h1></header>`;
}

async function loadJob(id) {
  if (job && job.id === id) return true;
  flush();
  job = await getJob(id);
  if (!job) { location.hash = '#/'; return false; }
  photos = await jobPhotos(id);
  return true;
}

function viewSite() {
  return `<div class="card"><h2>Systems on this job</h2><p class="std">Tap all that apply – each adds its own checklist.</p>
    <div class="sys">${SYS_KEYS.map(s => `<button data-sys="${s}" class="${job.systems.includes(s) ? 'on' : ''}">${SYSTEMS[s].name}</button>`).join('')}</div></div>
    <div class="card"><h2>Client & site</h2>${SITE.map(f => field(f, 'details.' + f.k)).join('')}</div>
    <div class="card"><h2>General notes</h2><p class="std">Tip: tap the microphone on your keyboard to dictate.</p>
    <textarea data-b="notes" style="min-height:140px">${esc(job.notes)}</textarea></div>
    <button class="btn danger block" data-act="deljob">Delete this survey</button>`;
}

function viewSystem(s) {
  const S = SYSTEMS[s];
  const n = filled(S.items, job.cl[s]);
  return `<div class="card"><h2>${S.name}</h2><p class="std">${esc(S.std)}</p>
    <div class="progress"><i style="width:${Math.round(100 * n / S.items.length)}%"></i></div>
    <p class="small muted">${n} of ${S.items.length} answered – blanks show as “not recorded” on the survey.</p>
    ${S.items.map(f => field(f, `cl.${s}.${f.k}`)).join('')}</div>`;
}

function deviceSummary(r) {
  return Object.entries(r.devices || {}).filter(([, c]) => c > 0).map(([d, c]) => `${d} ×${c}`).join(', ');
}
function viewRooms() {
  return `<p class="small muted">Add each room or area as you walk round. Add doors as their own entry for access control.</p>
    ${job.rooms.length ? job.rooms.map((r, i) => {
      const ph = photos.filter(p => p.roomId === r.id).length;
      return `<a class="item card" href="#/job/${job.id}/room/${r.id}" style="display:block;text-decoration:none;color:inherit">
        <div class="t">${i + 1}. ${esc(r.floor ? r.floor + ' – ' : '')}${esc(r.name || 'Unnamed area')}</div>
        <div class="s">${esc(deviceSummary(r) || 'No devices yet')}${ph ? ` · ${ph} photo${ph > 1 ? 's' : ''}` : ''}</div></a>`;
    }).join('') : `<div class="empty card">No rooms yet.</div>`}
    <button class="btn primary block" data-act="addroom">＋ Add room / area</button>`;
}

function viewRoom(r) {
  const P = 'room.' + r.id;
  const sysChips = job.systems.length ? job.systems : SYS_KEYS;
  const rp = photos.filter(p => p.roomId === r.id);
  const idx = job.rooms.indexOf(r);
  return `${head(`#/job/${job.id}/rooms`, (r.name || 'Room') + ' – ' + jobTitle(job))}
  <main>
    <div class="card">
      <div class="row">
        ${field({ l: 'Floor', t: 'text', h: 'G, 1st, Basement…' }, P + '.floor')}
        ${field({ l: 'Room / area name', t: 'text' }, P + '.name')}
      </div>
      ${field({ l: 'Use of room', t: 'text', h: 'Office, kitchen, plant room, store…' }, P + '.use')}
      <div class="row">
        ${field({ l: 'Ceiling height (m)', t: 'text' }, P + '.ceilH')}
        ${field({ l: 'Ceiling type', t: 'text', h: 'Plaster, suspended, open, sloped' }, P + '.ceilT')}
      </div>
    </div>
    ${sysChips.map(s => `<div class="card"><h2>${SYSTEMS[s].name} – devices</h2><p class="std">Tap to add, − to remove.</p>
      <div class="chips">${SYSTEMS[s].chips.map(c => {
        const n = (r.devices || {})[c] || 0;
        return `<span class="chip ${n ? 'has' : ''}">${n ? `<button class="minus" data-dev="${esc(c)}" data-d="-1" aria-label="Remove one">−</button><span class="c">${n}</span>` : ''}<button data-dev="${esc(c)}" data-d="1">${esc(c)}</button></span>`;
      }).join('')}</div>
      ${s === 'cctv' ? field({ l: 'CCTV requirement for cameras here', t: 'sel', o: CCTV_LEVELS, h: 'Observe / detect / recognise / identify (BS EN 62676-4)' }, P + '.cctvLevel') + field({ l: 'What must the camera see?', t: 'text' }, P + '.cctvView') : ''}
      ${s === 'access' ? field({ l: 'Door type & construction', t: 'text', h: 'Timber / aluminium / glass / steel, single or double' }, P + '.doorType') + field({ l: 'Fire door / escape route?', t: 'yn' }, P + '.doorFire') + field({ l: 'Existing lock / ironmongery', t: 'text' }, P + '.doorLock') : ''}
      </div>`).join('')}
    <div class="card"><h2>Notes</h2><p class="std">Positions, cable routes, problems. Tap the keyboard mic to dictate.</p>
      <textarea data-b="${P}.notes" style="min-height:120px">${esc(r.notes)}</textarea></div>
    <div class="card"><h2>Photos (${rp.length})</h2>
      <div class="row"><button class="btn primary" data-act="cam" data-room="${r.id}">📷 Take photo</button><button class="btn" data-act="gal" data-room="${r.id}">🖼 From gallery</button></div>
      ${photoGrid(rp)}</div>
    <div class="row">
      <button class="btn" data-act="dupRoom" data-room="${r.id}">Copy room</button>
      <button class="btn danger" data-act="delRoom" data-room="${r.id}">Delete room</button>
    </div>
    ${idx < job.rooms.length - 1 ? `<a class="btn block" href="#/job/${job.id}/room/${job.rooms[idx + 1].id}">Next room ›</a>` : `<button class="btn primary block" data-act="addroom">＋ Add next room</button>`}
  </main>`;
}

function photoGrid(list) {
  if (!list.length) return '';
  return `<div class="photos">${list.map(p => `<div class="photo" data-photo="${p.id}"><img loading="lazy" src="${photoURL(p)}" alt="">${p.caption ? `<div class="cap">${esc(p.caption)}</div>` : ''}</div>`).join('')}</div>`;
}

function viewVariations() {
  return `<div class="card"><h2>Variations from the standard</h2>
    <p class="std">Anything that won't fully meet the standard, agreed with the client – e.g. no detector in a toilet, reduced coverage at client request, no police response. Record who agreed it. Auditors look for this.</p></div>
    ${job.variations.map((v, i) => `<div class="card var">
      <b>Variation ${i + 1}</b>
      ${field({ l: 'What is the variation?', t: 'area' }, `var.${v.id}.text`)}
      ${field({ l: 'Reason', t: 'text' }, `var.${v.id}.reason`)}
      ${field({ l: 'Agreed by (name & role)', t: 'text' }, `var.${v.id}.agreedBy`)}
      <button class="btn danger block" data-act="delVar" data-var="${v.id}">Remove</button></div>`).join('')}
    <button class="btn primary block" data-act="addVar">＋ Add variation</button>`;
}

function viewPhotos() {
  const general = photos.filter(p => !p.roomId);
  return `<div class="card"><h2>General photos (${general.length})</h2>
    <p class="std">Outside of building, panel, supply, existing kit, floor plan / fire plan. Room photos are added from each room.</p>
    <div class="row"><button class="btn primary" data-act="cam">📷 Take photo</button><button class="btn" data-act="gal">🖼 From gallery</button></div>
    ${photoGrid(general)}</div>
    ${job.rooms.filter(r => photos.some(p => p.roomId === r.id)).map(r => `<div class="card"><h2>${esc(r.name || 'Room')}</h2>${photoGrid(photos.filter(p => p.roomId === r.id))}</div>`).join('')}`;
}

function viewSend() {
  const gaps = [];
  ['company', 'address', 'contact'].forEach(k => { if (!job.details[k]) gaps.push(SITE.find(f => f.k === k).l); });
  if (!job.systems.length) gaps.push('No system type selected');
  if (job.systems.includes('fire') && !job.cl.fire?.cat) gaps.push('Fire alarm Category');
  if (job.systems.includes('intruder') && !job.cl.intruder?.grade) gaps.push('Intruder security grade');
  if (!job.rooms.length) gaps.push('No rooms added');
  return `<div class="card"><h2>Status</h2>${segs('<label class="f">Survey status', 'status', ['Surveying', 'Ready to quote', 'Quoted'], job.status)}</div>
    ${gaps.length ? `<div class="card" style="border-color:var(--warn)"><h2>Before you send</h2><p class="std">These are blank:</p><ul>${gaps.map(g => `<li>${esc(g)}</li>`).join('')}</ul></div>` : ''}
    <div class="card"><h2>Send to Claude</h2>
      <p class="std">When you have signal: tap <b>Share</b> and choose the Claude app. It sends the survey text and all ${photos.length} photo${photos.length === 1 ? '' : 's'}. Then ask Claude to prepare the quote.</p>
      <button class="btn primary block" data-act="share">Share survey + photos</button>
      <button class="btn block" data-act="copy">Copy survey text only</button>
      <button class="btn block" data-act="zip">Download job pack (.zip) for your files</button>
      <p class="small muted">Keep the .zip on the job file – it's your survey record for SSAIB / BAFE audits.</p>
    </div>
    <div class="card"><h2>Preview</h2><pre class="preview">${esc(surveyText())}</pre></div>`;
}

async function viewJob(id, tab) {
  if (!(await loadJob(id))) return;
  if (tab !== 'site' && SYSTEMS[tab] && !job.systems.includes(tab)) tab = 'site';
  const body = tab === 'site' ? viewSite() : SYSTEMS[tab] ? viewSystem(tab) : tab === 'rooms' ? viewRooms()
    : tab === 'var' ? viewVariations() : tab === 'photos' ? viewPhotos() : viewSend();
  app.innerHTML = `${head('#/', jobTitle(job))}${tabs(tab)}<main>${body}</main>`;
}

async function route() {
  const p = location.hash.replace(/^#\/?/, '').split('/');
  const y = window.scrollY, same = route.last === location.hash;
  if (p[0] === 'job' && p[1]) {
    if (p[2] === 'room' && p[3]) {
      if (!(await loadJob(p[1]))) return;
      const r = job.rooms.find(x => x.id === p[3]);
      if (!r) { location.hash = `#/job/${job.id}/rooms`; return; }
      app.innerHTML = viewRoom(r);
    } else await viewJob(p[1], p[2] || 'site');
  } else await viewHome();
  window.scrollTo(0, same ? y : 0);
  route.last = location.hash;
}
const rerender = () => route();
window.addEventListener('hashchange', route);

/* ---------------- Events ---------------- */
app.addEventListener('input', e => {
  const b = e.target.dataset.b;
  if (b) { setV(b, e.target.value); if (b.startsWith('details.ref') || b === 'details.company') { const h = $('header.top h1'); if (h) h.textContent = jobTitle(job); } }
});
app.addEventListener('change', e => { const b = e.target.dataset.b; if (b) setV(b, e.target.value); });

app.addEventListener('click', async e => {
  const el = e.target.closest('button, [data-photo]');
  if (!el) return;
  const d = el.dataset;
  if (d.go) { location.hash = d.go; return; }
  if (d.set) { setV(d.set, getV(d.set) === d.v && d.set !== 'status' ? '' : d.v); flush(); return rerender(); }
  if (d.sys) {
    const i = job.systems.indexOf(d.sys);
    i >= 0 ? job.systems.splice(i, 1) : job.systems.push(d.sys);
    job.systems.sort((a, b) => SYS_KEYS.indexOf(a) - SYS_KEYS.indexOf(b));
    save(); flush(); return rerender();
  }
  if (d.dev) {
    const r = job.rooms.find(x => location.hash.endsWith(x.id));
    r.devices = r.devices || {};
    r.devices[d.dev] = Math.max(0, (r.devices[d.dev] || 0) + Number(d.d));
    if (!r.devices[d.dev]) delete r.devices[d.dev];
    save(); flush(); return rerender();
  }
  if (d.photo) return openPhoto(d.photo);
  switch (d.act) {
    case 'newjob': { const j = newJob(); await putJob(j); location.hash = `#/job/${j.id}/site`; break; }
    case 'deljob':
      if (confirm('Delete this survey and all its photos? This cannot be undone.')) {
        for (const p of photos) await delPhotoDB(p.id);
        await delJobDB(job.id); job = null; location.hash = '#/';
      } break;
    case 'addroom': {
      const last = job.rooms[job.rooms.length - 1];
      const r = { id: uid(), floor: last?.floor || '', name: '', devices: {} };
      job.rooms.push(r); save(); flush(); location.hash = `#/job/${job.id}/room/${r.id}`;
      setTimeout(() => document.querySelector(`[data-b="room.${r.id}.name"]`)?.focus(), 150);
      break;
    }
    case 'dupRoom': {
      const src = job.rooms.find(x => x.id === d.room);
      const r = JSON.parse(JSON.stringify(src)); r.id = uid(); r.name = (src.name || 'Room') + ' (copy)';
      job.rooms.splice(job.rooms.indexOf(src) + 1, 0, r); save(); flush();
      location.hash = `#/job/${job.id}/room/${r.id}`; toast('Room copied – rename it'); break;
    }
    case 'delRoom': {
      const rp = photos.filter(p => p.roomId === d.room);
      if (!confirm(`Delete this room${rp.length ? ` and its ${rp.length} photo(s)` : ''}?`)) break;
      for (const p of rp) await delPhotoDB(p.id);
      photos = photos.filter(p => p.roomId !== d.room);
      job.rooms = job.rooms.filter(x => x.id !== d.room); save(); flush();
      location.hash = `#/job/${job.id}/rooms`; break;
    }
    case 'addVar': job.variations.push({ id: uid(), text: '', reason: '', agreedBy: '' }); save(); flush(); rerender(); break;
    case 'delVar': if (confirm('Remove this variation?')) { job.variations = job.variations.filter(v => v.id !== d.var); save(); flush(); rerender(); } break;
    case 'cam': pendingRoom = d.room || null; $('#camIn').click(); break;
    case 'gal': pendingRoom = d.room || null; $('#galIn').click(); break;
    case 'share': shareJob(); break;
    case 'copy': copyText(); break;
    case 'zip': downloadZip(); break;
    case 'menu': backupMenu(); break;
  }
});

/* ---------------- Photos ---------------- */
let pendingRoom = null;
async function shrink(file) {
  const MAX = 1600;
  let bmp;
  try { bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
  catch { bmp = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); }); }
  const w = bmp.width, h = bmp.height, k = Math.min(1, MAX / Math.max(w, h));
  const c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise(res => c.toBlob(b => res(b || file), 'image/jpeg', 0.82));
}
async function addFiles(files) {
  if (!files.length || !job) return;
  toast(`Saving ${files.length} photo${files.length > 1 ? 's' : ''}…`);
  for (const f of files) {
    const p = { id: uid(), jobId: job.id, roomId: pendingRoom, caption: '', created: Date.now(), blob: await shrink(f) };
    await putPhoto(p); photos.push(p);
  }
  save(); flush(); toast('Photo saved'); rerender();
}
['#camIn', '#galIn'].forEach(s => $(s).addEventListener('change', e => { addFiles([...e.target.files]); e.target.value = ''; }));

function openPhoto(id) {
  const p = photos.find(x => x.id === id); if (!p) return;
  const dlg = document.createElement('dialog');
  const rooms = job.rooms.map(r => `<option value="${r.id}"${r.id === p.roomId ? ' selected' : ''}>${esc(r.name || 'Unnamed')}</option>`).join('');
  dlg.innerHTML = `<img src="${photoURL(p)}" alt=""><div class="in">
    <label class="f">Caption<input type="text" id="pcap" value="${esc(p.caption)}" placeholder="e.g. Panel position by front door"></label>
    <label class="f">Belongs to<select id="proom"><option value="">General</option>${rooms}</select></label>
    <div class="row" style="margin-top:12px"><button class="btn danger" id="pdel">Delete</button><button class="btn primary" id="pok">Done</button></div></div>`;
  document.body.appendChild(dlg); dlg.showModal();
  const close = async () => {
    p.caption = dlg.querySelector('#pcap').value.trim();
    p.roomId = dlg.querySelector('#proom').value || null;
    await putPhoto(p); dlg.close(); dlg.remove(); rerender();
  };
  dlg.querySelector('#pok').onclick = close;
  dlg.addEventListener('cancel', e => { e.preventDefault(); close(); });
  dlg.querySelector('#pdel').onclick = async () => {
    if (!confirm('Delete this photo?')) return;
    await delPhotoDB(p.id); photos = photos.filter(x => x.id !== p.id); dlg.close(); dlg.remove(); rerender();
  };
}

/* ---------------- Survey text ---------------- */
function orderedPhotos() {
  const order = [...photos.filter(p => !p.roomId)];
  job.rooms.forEach(r => order.push(...photos.filter(p => p.roomId === r.id)));
  photos.filter(p => p.roomId && !job.rooms.some(r => r.id === p.roomId)).forEach(p => order.push(p));
  return order.map((p, i) => ({ p, code: 'P' + String(i + 1).padStart(2, '0') }));
}
const safe = s => String(s || '').replace(/[^\w\- ]+/g, '').trim().slice(0, 40);
function photoName(code, p) {
  const r = job.rooms.find(x => x.id === p.roomId);
  return `${code} ${safe(r ? r.name || 'Room' : 'General')}${p.caption ? ' - ' + safe(p.caption) : ''}.jpg`.replace(/\s+/g, ' ');
}

function surveyText() {
  const NR = '— not recorded —';
  const L = [];
  const v = x => (String(x ?? '').trim() || NR);
  const sec = t => { L.push('', '== ' + t + ' ==' ); };
  const ph = orderedPhotos();
  L.push('WDT ALARMS LTD – SITE SURVEY');
  L.push('Please prepare a quote from this survey using the WDT quote rules.');
  L.push(`Surveyed by: Wayne Twiddy   Date: ${ukDate(job.details.date) || NR}   Status: ${job.status}`);
  L.push('Systems: ' + (job.systems.map(s => SYSTEMS[s].name).join(', ') || NR));
  sec('CLIENT & SITE');
  SITE.forEach(f => { if (f.k !== 'date') L.push(`${f.l}: ${v(job.details[f.k]).replace(/\n/g, ', ')}`); });
  job.systems.forEach(s => {
    const S = SYSTEMS[s]; sec(`${S.name.toUpperCase()} (${S.std})`);
    S.items.forEach(f => L.push(`${f.l}: ${v((job.cl[s] || {})[f.k]).replace(/\n/g, ' / ')}`));
  });
  sec(`ROOMS / AREAS (${job.rooms.length})`);
  if (!job.rooms.length) L.push(NR);
  job.rooms.forEach((r, i) => {
    L.push(`${i + 1}. ${r.floor ? r.floor + ' – ' : ''}${r.name || 'Unnamed area'}`);
    if (r.use) L.push(`   Use: ${r.use}`);
    if (r.ceilH || r.ceilT) L.push(`   Ceiling: ${[r.ceilH && r.ceilH + ' m', r.ceilT].filter(Boolean).join(', ')}`);
    L.push(`   Devices: ${deviceSummary(r) || 'none'}`);
    if (r.cctvLevel || r.cctvView) L.push(`   CCTV: ${[r.cctvLevel, r.cctvView].filter(Boolean).join(' – ')}`);
    if (r.doorType || r.doorFire || r.doorLock) L.push(`   Door: ${[r.doorType, r.doorFire && 'Fire door/escape route: ' + r.doorFire, r.doorLock && 'Lock: ' + r.doorLock].filter(Boolean).join('; ')}`);
    if (r.notes) L.push(`   Notes: ${r.notes.replace(/\n/g, ' / ')}`);
    const rp = ph.filter(x => x.p.roomId === r.id).map(x => x.code);
    if (rp.length) L.push(`   Photos: ${rp.join(', ')}`);
  });
  const tot = {};
  job.rooms.forEach(r => Object.entries(r.devices || {}).forEach(([d, c]) => { tot[d] = (tot[d] || 0) + c; }));
  sec('DEVICE TOTALS');
  L.push(Object.keys(tot).length ? Object.entries(tot).map(([d, c]) => `${d}: ${c}`).join('\n') : NR);
  sec('VARIATIONS AGREED WITH CLIENT');
  L.push(job.variations.length ? job.variations.map((x, i) => `${i + 1}. ${v(x.text)} | Reason: ${v(x.reason)} | Agreed by: ${v(x.agreedBy)}`).join('\n') : 'None recorded');
  sec('GENERAL NOTES');
  L.push(v(job.notes));
  sec(`PHOTOS (${ph.length})`);
  L.push(ph.length ? ph.map(x => photoName(x.code, x.p).replace(/\.jpg$/, '')).join('\n') : 'None');
  return L.join('\n');
}
const baseName = () => safe(jobTitle(job)) || 'survey';

/* ---------------- Export: share / copy / zip ---------------- */
async function copyText() {
  try { await navigator.clipboard.writeText(surveyText()); toast('Survey text copied'); }
  catch { toast('Could not copy – use Share instead'); }
}
async function shareJob() {
  flush();
  const files = [new File([surveyText()], baseName() + ' - survey.txt', { type: 'text/plain' })];
  orderedPhotos().forEach(({ p, code }) => files.push(new File([p.blob], photoName(code, p), { type: 'image/jpeg' })));
  if (navigator.canShare && navigator.canShare({ files })) {
    try { await navigator.share({ files, title: jobTitle(job) }); return; }
    catch (e) { if (e.name === 'AbortError') return; }
  }
  toast('Sharing not available – downloading the job pack instead');
  downloadZip();
}

// Minimal ZIP writer (stored, no compression – photos are already JPEG)
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(u8) { let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
async function makeZip(entries) {
  const enc = new TextEncoder(), parts = [], central = [];
  let off = 0;
  const d = new Date();
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
  const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  for (const e of entries) {
    const name = enc.encode(e.name);
    const data = e.data instanceof Blob ? new Uint8Array(await e.data.arrayBuffer()) : enc.encode(e.data);
    const crc = crc32(data);
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true);
    lh.setUint16(10, time, true); lh.setUint16(12, date, true); lh.setUint32(14, crc, true);
    lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true); lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
    parts.push(lh, name, data);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true);
    ch.setUint16(12, time, true); ch.setUint16(14, date, true); ch.setUint32(16, crc, true);
    ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true); ch.setUint16(28, name.length, true);
    ch.setUint32(42, off, true);
    central.push(ch, name);
    off += 30 + name.length + data.length;
  }
  const cSize = central.reduce((a, x) => a + x.byteLength, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, entries.length, true); end.setUint16(10, entries.length, true);
  end.setUint32(12, cSize, true); end.setUint32(16, off, true);
  return new Blob([...parts, ...central, end], { type: 'application/zip' });
}
function download(blob, name) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
async function downloadZip() {
  flush();
  const entries = [{ name: 'survey.txt', data: surveyText() }];
  orderedPhotos().forEach(({ p, code }) => entries.push({ name: 'photos/' + photoName(code, p), data: p.blob }));
  download(await makeZip(entries), baseName() + '.zip');
}

/* ---------------- Backup / restore ---------------- */
const b64 = blob => new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
function backupMenu() {
  const dlg = document.createElement('dialog');
  dlg.innerHTML = `<div class="in"><h2 style="margin-top:0">Backup</h2>
    <p class="small muted">Surveys are stored only on this phone. Save a backup file to Google Drive or email it to yourself now and then, and before changing phones.</p>
    <button class="btn primary block" id="bk">Save backup of all surveys</button>
    <button class="btn block" id="rs">Restore from a backup file</button>
    <button class="btn block" id="cl">Close</button></div>`;
  document.body.appendChild(dlg); dlg.showModal();
  const done = () => { dlg.close(); dlg.remove(); };
  dlg.querySelector('#cl').onclick = done;
  dlg.querySelector('#bk').onclick = async () => {
    toast('Preparing backup…');
    const jobs = await getAllJobs(), ps = await allPhotos();
    const out = { app: 'wdt-survey', version: 1, saved: new Date().toISOString(), jobs, photos: [] };
    for (const p of ps) out.photos.push({ ...p, blob: undefined, data: await b64(p.blob) });
    download(new Blob([JSON.stringify(out)], { type: 'application/json' }), `WDT survey backup ${today()}.json`);
    done();
  };
  dlg.querySelector('#rs').onclick = () => { done(); $('#restoreIn').click(); };
}
$('#restoreIn').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = '';
  if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    if (data.app !== 'wdt-survey') throw new Error('Not a WDT survey backup');
    if (!confirm(`Restore ${data.jobs.length} survey(s)? Surveys with the same ID on this phone will be replaced.`)) return;
    for (const j of data.jobs) await putJob(j);
    for (const p of data.photos) {
      const blob = await (await fetch(p.data)).blob();
      const { data: _, ...rest } = p;
      await putPhoto({ ...rest, blob });
    }
    toast('Backup restored'); job = null; route();
  } catch (err) { alert('Restore failed: ' + err.message); }
});

/* ---------------- Start ---------------- */
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});
route();
