const entities = {
  catways: {
    label: 'Catways',
    listUrl: '/catways',
    createUrl: () => '/catways',
    itemUrl: (r) => `/catways/${r.catwayNumber}`,
    fields: [
      { name: 'catwayNumber', label: 'Numéro', type: 'number', locked: true },
      { name: 'catwayType', label: 'Type', type: 'select', options: ['short', 'long'], locked: true },
      { name: 'catwayState', label: 'État', type: 'text' }
    ]
  },
  reservations: {
    label: 'Réservations',
    listUrl: '/reservations',
    createUrl: (f) => `/catways/${f.catwayNumber}/reservations`,
    itemUrl: (r) => `/catways/${r.catwayNumber}/reservations/${r._id}`,
    fields: [
      { name: 'catwayNumber', label: 'Catway n°', type: 'number', locked: true },
      { name: 'clientName', label: 'Client', type: 'text' },
      { name: 'boatName', label: 'Bateau', type: 'text' },
      { name: 'startDate', label: 'Début', type: 'date' },
      { name: 'endDate', label: 'Fin', type: 'date' }
    ]
  },
  users: {
    label: 'Utilisateurs',
    listUrl: '/users',
    createUrl: () => '/users',
    itemUrl: (r) => `/users/${encodeURIComponent(r.email)}`,
    fields: [
      { name: 'username', label: "Nom d'utilisateur", type: 'text' },
      { name: 'email', label: 'E-mail', type: 'email' },
      { name: 'password', label: 'Mot de passe', type: 'password', hiddenInTable: true, optionalOnEdit: true }
    ]
  }
};

const tabsEl = document.getElementById('tabs');
const formEl = document.getElementById('entity-form');
const tableEl = document.getElementById('entity-table');
const noticeEl = document.getElementById('notice');

let current = 'catways';
let editing = null; // enregistrement en cours de modification

async function api(method, url, body) {
  const res = await fetch(url, {
    method,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  if (res.status === 401) {
    window.location.href = '/';
    throw new Error('Session expirée');
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new Error((data && data.message) || 'Une erreur est survenue');
  return data;
}

function notify(message, isError) {
  noticeEl.textContent = message;
  noticeEl.className = isError ? 'notice error' : 'notice';
  noticeEl.hidden = !message;
}

function el(tag, attrs = {}, text) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  if (text !== undefined) node.textContent = text;
  return node;
}

function display(field, value) {
  if (value === undefined || value === null) return '';
  if (field.type === 'date') return new Date(value).toLocaleDateString('fr-FR');
  return String(value);
}

function renderTabs() {
  tabsEl.replaceChildren();
  Object.entries(entities).forEach(([key, ent]) => {
    const btn = el('button', { type: 'button', role: 'tab', 'aria-selected': String(key === current) }, ent.label);
    btn.addEventListener('click', () => {
      current = key;
      editing = null;
      notify('');
      renderAll();
    });
    tabsEl.append(btn);
  });
}

function renderForm() {
  const ent = entities[current];
  formEl.replaceChildren();
  formEl.append(el('h2', {}, editing ? `Modifier ${ent.label.toLowerCase()}` : `Ajouter dans ${ent.label.toLowerCase()}`));
  const grid = el('div', { class: 'fields' });
  ent.fields.forEach((f) => {
    const label = el('label');
    label.append(el('span', {}, f.label));
    let input;
    if (f.type === 'select') {
      input = el('select', { name: f.name });
      f.options.forEach((o) => input.append(el('option', { value: o }, o)));
    } else {
      input = el('input', { name: f.name, type: f.type });
      if (f.type === 'password') input.setAttribute('autocomplete', 'new-password');
    }
    if (editing) {
      if (f.locked) input.disabled = true;
      if (f.type !== 'password') {
        const v = editing[f.name];
        input.value = f.type === 'date' && v ? String(v).slice(0, 10) : v ?? '';
      } else input.placeholder = 'Laisser vide pour ne pas changer';
    }
    label.append(input);
    grid.append(label);
  });
  formEl.append(grid);
  const actions = el('div', { class: 'actions' });
  actions.append(el('button', { type: 'submit', class: 'btn' }, editing ? 'Enregistrer' : 'Ajouter'));
  if (editing) {
    const cancel = el('button', { type: 'button', class: 'btn ghost' }, 'Annuler');
    cancel.addEventListener('click', () => { editing = null; renderForm(); });
    actions.append(cancel);
  }
  formEl.append(actions);
}

async function renderTable() {
  const ent = entities[current];
  tableEl.replaceChildren();
  let rows = [];
  try {
    rows = await api('GET', ent.listUrl);
  } catch (err) {
    notify(err.message, true);
    return;
  }
  const visible = ent.fields.filter((f) => !f.hiddenInTable);
  const thead = el('thead');
  const head = el('tr');
  visible.forEach((f) => head.append(el('th', {}, f.label)));
  head.append(el('th', {}, 'Actions'));
  thead.append(head);
  tableEl.append(thead);
  const body = el('tbody');
  if (!rows.length) {
    const tr = el('tr');
    tr.append(el('td', { colspan: visible.length + 1 }, 'Rien à afficher pour le moment. Utilisez le formulaire pour ajouter un premier élément.'));
    body.append(tr);
  }
  rows.forEach((r) => {
    const tr = el('tr');
    visible.forEach((f) => tr.append(el('td', {}, display(f, r[f.name]))));
    const td = el('td', { class: 'row-actions' });
    const edit = el('button', { type: 'button', class: 'link-btn' }, 'Modifier');
    edit.addEventListener('click', () => { editing = r; notify(''); renderForm(); formEl.scrollIntoView({ behavior: 'smooth' }); });
    const del = el('button', { type: 'button', class: 'link-btn danger' }, 'Supprimer');
    del.addEventListener('click', async () => {
      if (!confirm('Supprimer cet élément ?')) return;
      try {
        await api('DELETE', ent.itemUrl(r));
        notify('Élément supprimé');
        if (editing && editing._id === r._id) editing = null;
        renderAll();
      } catch (err) { notify(err.message, true); }
    });
    td.append(edit, del);
    tr.append(td);
    body.append(tr);
  });
  tableEl.append(body);
}

formEl.addEventListener('submit', async (event) => {
  event.preventDefault();
  const ent = entities[current];
  const body = {};
  ent.fields.forEach((f) => {
    if (editing && f.locked) return;
    const raw = formEl.elements[f.name].value;
    if (raw === '' && f.optionalOnEdit && editing) return;
    body[f.name] = f.type === 'number' && raw !== '' ? Number(raw) : raw;
  });
  try {
    if (editing) {
      await api('PUT', ent.itemUrl(editing), body);
      notify('Modifications enregistrées');
    } else {
      await api('POST', ent.createUrl(body), body);
      notify('Élément ajouté');
    }
    editing = null;
    renderAll();
  } catch (err) {
    notify(err.message, true);
  }
});

function renderAll() {
  renderTabs();
  renderForm();
  renderTable();
}

renderAll();
