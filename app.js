/* =========================================
   Clínica Dental — Front-end (GitHub Pages)
   Conecta em Google Apps Script (Web App)
   ========================================= */

const CFG = { SCRIPT_URL: '', API_KEY: '' };
let STATE = {
  raw: [],        // lista completa original
  view: [],       // lista filtrada
  sortKey: 'date',
  sortDir: 'asc'
};

async function loadConfig() {
  try {
    const res = await fetch('./app-config.json', { cache: 'no-store' });
    if (res.ok) {
      const j = await res.json();
      CFG.SCRIPT_URL = j.SCRIPT_URL || '';
      CFG.API_KEY = j.API_KEY || '';
    } else {
      throw new Error('Config não encontrada');
    }
  } catch (e) {
    console.warn('Config fallback via localStorage', e);
    CFG.SCRIPT_URL = localStorage.getItem('DENTAL_API_URL') || '';
    CFG.API_KEY = localStorage.getItem('DENTAL_API_KEY') || '';
  }
}

function setOnline(ok) {
  const el = document.getElementById('conn');
  if (ok) { el.classList.remove('bad'); el.classList.add('ok'); el.textContent = 'online'; }
  else { el.classList.remove('ok'); el.classList.add('bad'); el.textContent = 'offline'; }
}

async function apiGet(path) {
  const sep = path.includes('?') ? '&' : '?';
  const r = await fetch(CFG.SCRIPT_URL + path + sep + 'token=' + encodeURIComponent(CFG.API_KEY), {
    method:'GET', mode:'cors', credentials:'omit'
  });
  return r.json();
}

async function apiPost(body) {
  const r = await fetch(CFG.SCRIPT_URL + '?token=' + encodeURIComponent(CFG.API_KEY), {
    method:'POST', mode:'cors', credentials:'omit',
    body: JSON.stringify(body) // sem headers p/ evitar preflight
  });
  return r.json();
}

// --------------- Helpers --------------- //
function formatDate(d) {
  if (!d) return '';
  try {
    const dt = (typeof d === 'string') ? new Date(d) : d;
    if (String(dt) === 'Invalid Date') return d;
    return dt.toLocaleDateString('pt-BR');
  } catch { return d; }
}

function sortBy(list, key, dir) {
  const k = key;
  const s = [...list].sort((a,b) => {
    const av = (a?.[k] ?? '').toString().toLowerCase();
    const bv = (b?.[k] ?? '').toString().toLowerCase();
    if (av < bv) return -1;
    if (av > bv) return 1;
    return 0;
  });
  return dir === 'desc' ? s.reverse() : s;
}

function toCSV(rows) {
  if (!rows.length) return '';
  const headers = ['id','patientName','phone','email','cpf','date','time','type','duration','status','notes'];
  const safe = v => ('"' + String(v ?? '').replace(/"/g,'""') + '"');
  const data = rows.map(r => headers.map(h => safe(r[h])));
  return [headers.map(safe).join(','), ...data.map(r => r.join(','))].join('\n');
}

function download(name, text, mime='text/plain;charset=utf-8') {
  const blob = new Blob([text], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// --------------- UI render --------------- //
function render() {
  const tbody = document.getElementById('tbody');
  const empty = document.getElementById('empty');
  tbody.innerHTML = '';

  const rows = STATE.view;
  if (!rows.length) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  rows.forEach(a => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${String(a.id||'').slice(-6).toUpperCase()}</td>
      <td>${a.patientName||''}</td>
      <td>${formatDate(a.date)}</td>
      <td>${a.time||''}</td>
      <td>${a.type||''}</td>
      <td>${a.status||''}</td>
      <td>
        <button class="btn ghost" data-act="edit" data-id="${a.id}">Editar</button>
        <button class="btn" data-act="status" data-id="${a.id}">Concluir</button>
        <button class="btn alt" data-act="delete" data-id="${a.id}">Excluir</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

function applyFilters() {
  const q = document.getElementById('search').value.trim().toLowerCase();
  const st = document.getElementById('statusFilter').value;
  let list = [...STATE.raw];
  if (q) list = list.filter(x => (x.patientName||'').toLowerCase().includes(q));
  if (st) list = list.filter(x => (x.status||'') === st);
  STATE.view = sortBy(list, STATE.sortKey, STATE.sortDir);
  render();
}

// --------------- Actions --------------- //
async function testConn() {
  try {
    const j = await apiGet('?action=ping');
    setOnline(!!j.success);
  } catch {
    setOnline(false);
  }
}

async function loadAll() {
  const j = await apiGet('?action=getAll');
  STATE.raw = Array.isArray(j.appointments) ? j.appointments : (j.data?.appointments || []);
  applyFilters();
  setOnline(true);
}

function fillForm(a={}) {
  const set = (id, v) => document.getElementById(id).value = v ?? '';
  set('id', a.id);
  set('patientName', a.patientName);
  set('phone', a.phone);
  set('email', a.email);
  set('cpf', a.cpf);
  set('date', a.date ? new Date(a.date).toISOString().slice(0,10) : '');
  set('time', a.time);
  set('type', a.type);
  set('duration', a.duration || '');
  set('status', a.status || 'pendente');
  set('notes', a.notes);
  document.getElementById('patientName').focus();
}

function readForm() {
  const g = id => document.getElementById(id).value.trim();
  const data = {
    id: g('id') || undefined,
    patientName: g('patientName'),
    phone: g('phone'),
    email: g('email'),
    cpf: g('cpf'),
    date: g('date'),
    time: g('time'),
    type: g('type'),
    duration: Number(g('duration')||0),
    status: g('status'),
    notes: g('notes')
  };
  return data;
}

async function createOrUpdate(e) {
  e.preventDefault();
  const data = readForm();
  if (!data.patientName || !data.date || !data.time) {
    alert('Preencha nome, data e hora.');
    return;
  }
  const action = data.id ? 'update' : 'create';
  const j = await apiPost({ action, data });
  if (!j.success) {
    alert('Erro: ' + (j.error||'falha na operação'));
    return;
  }
  await loadAll();
  if (!data.id) fillForm({}); // limpar após criar
  alert(action === 'create' ? 'Criado com sucesso!' : 'Atualizado com sucesso!');
}

async function deleteItem(id) {
  if (!confirm('Confirmar exclusão?')) return;
  const j = await apiPost({ action:'delete', data:{ id } });
  if (!j.success) { alert('Erro ao excluir'); return; }
  await loadAll();
  alert('Excluído.');
}

async function markDone(id) {
  // Atualiza status -> concluido
  const a = STATE.raw.find(x => x.id === id);
  if (!a) return;
  const j = await apiPost({ action:'update', data: { id, status:'concluido' } });
  if (!j.success) { alert('Erro ao atualizar status'); return; }
  await loadAll();
}

function exportCSV() {
  const csv = toCSV(STATE.view);
  if (!csv) { alert('Nada para exportar.'); return; }
  download('agendamentos.csv', csv, 'text/csv;charset=utf-8');
}

// --------------- Events --------------- //
function bindEvents() {
  document.getElementById('btnTest').addEventListener('click', testConn);
  document.getElementById('btnReload').addEventListener('click', loadAll);
  document.getElementById('btnCSV').addEventListener('click', exportCSV);
  document.getElementById('btnNew').addEventListener('click', () => fillForm({ status: 'pendente', duration:30 }));
  document.getElementById('form').addEventListener('submit', createOrUpdate);
  document.getElementById('btnClear').addEventListener('click', (e) => { e.preventDefault(); fillForm({}); });

  document.getElementById('search').addEventListener('input', applyFilters);
  document.getElementById('statusFilter').addEventListener('change', applyFilters);

  document.getElementById('tbody').addEventListener('click', (e) => {
    const btn = e.target.closest('button'); if (!btn) return;
    const id = btn.dataset.id;
    const act = btn.dataset.act;
    if (act === 'edit') {
      const a = STATE.raw.find(x => x.id === id);
      if (a) fillForm(a);
    } else if (act === 'delete') {
      deleteItem(id);
    } else if (act === 'status') {
      markDone(id);
    }
  });

  // sort headers
  document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (STATE.sortKey === key) {
        STATE.sortDir = (STATE.sortDir === 'asc' ? 'desc' : 'asc');
      } else {
        STATE.sortKey = key; STATE.sortDir = 'asc';
      }
      applyFilters();
    });
  });
}

// --------------- Boot --------------- //
(async function init(){
  await loadConfig();
  bindEvents();
  await testConn();
  await loadAll();
})();
