const $ = (selector) => document.querySelector(selector);
const state = { tasks: [], filter: 'all', search: '', priority: 'all', sort: 'deadline', busy: false, toastTimer: null };
const els = {
  list: $('#task-list'), modal: $('#modal-backdrop'), form: $('#task-form'), title: $('#task-title'), description: $('#task-description'), deadline: $('#task-deadline'), priority: $('#task-priority'), status: $('#task-status'), id: $('#task-id'), modalTitle: $('#modal-title'), error: $('#form-error'), save: $('#save-task-btn'), toast: $('#toast')
};
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const dateToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const prettyDate = (date) => { if (!date) return 'No due date'; const d = new Date(`${date}T12:00:00`); return Number.isNaN(d.getTime()) ? 'No due date' : d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}); };
const isOverdue = task => task.deadline && task.deadline < dateToday() && task.status !== 'Completed';
function toast(message) { els.toast.textContent = message; els.toast.classList.add('show'); clearTimeout(state.toastTimer); state.toastTimer = setTimeout(() => els.toast.classList.remove('show'), 2600); }
async function api(url, options = {}) {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || 'Something went wrong. Please try again.');
  return data;
}
async function loadTasks(showMessage = false) {
  els.list.innerHTML = '<div class="loading-state">Loading your tasks…</div>';
  try { state.tasks = await api('/api/tasks'); render(); if (showMessage) toast('Tasks refreshed.'); }
  catch (error) { els.list.innerHTML = `<div class="empty-state"><div class="empty-icon">!</div><strong>Couldn't load your tasks</strong><p>${escapeHtml(error.message)} Make sure the server is running.</p><button class="outline-button" id="retry-load">Try again</button></div>`; $('#retry-load')?.addEventListener('click', () => loadTasks()); }
}
function updateStats() {
  const total = state.tasks.length, todo = state.tasks.filter(t=>t.status==='To Do').length, progress = state.tasks.filter(t=>t.status==='In Progress').length, completed = state.tasks.filter(t=>t.status==='Completed').length;
  $('#stat-total').textContent = total; $('#stat-todo').textContent = todo; $('#stat-progress').textContent = progress; $('#stat-completed').textContent = completed;
  $('#nav-all').textContent = total; $('#nav-todo').textContent = todo; $('#nav-progress').textContent = progress; $('#nav-completed').textContent = completed;
  $('#completion-note').textContent = total ? `${Math.round(completed / total * 100)}% of all tasks` : 'Every win counts';
}
function filteredTasks() {
  let list = state.tasks.filter(t => state.filter === 'all' || t.status === state.filter);
  if (state.search) { const q = state.search.toLowerCase(); list = list.filter(t => `${t.title} ${t.description}`.toLowerCase().includes(q)); }
  if (state.priority !== 'all') list = list.filter(t => t.priority === state.priority);
  list = [...list];
  if (state.sort === 'deadline') list.sort((a,b) => (a.deadline || '9999-12-31').localeCompare(b.deadline || '9999-12-31'));
  if (state.sort === 'priority') { const rank = {High:0,Medium:1,Low:2}; list.sort((a,b) => rank[a.priority]-rank[b.priority]); }
  if (state.sort === 'newest') list.sort((a,b) => b.id-a.id);
  if (state.sort === 'title') list.sort((a,b) => a.title.localeCompare(b.title));
  return list;
}
function taskMarkup(task) {
  const complete = task.status === 'Completed';
  const priorityClass = `priority-${task.priority.toLowerCase()}`;
  const deadlineClass = isOverdue(task) ? 'task-deadline overdue' : 'task-deadline';
  return `<article class="task-row ${complete?'is-completed':''}" data-task-row="${task.id}">
    <div class="task-main"><input class="task-check" type="checkbox" aria-label="Mark ${escapeHtml(task.title)} completed" data-action="complete" data-id="${task.id}" ${complete?'checked':''}><div class="task-copy"><div class="task-title">${escapeHtml(task.title)}</div>${task.description?`<div class="task-description">${escapeHtml(task.description)}</div>`:''}</div></div>
    <div class="task-deadline ${deadlineClass.includes('overdue')?'overdue':''}">${task.deadline?escapeHtml(prettyDate(task.deadline)):'No due date'}${isOverdue(task)?'<small>Overdue</small>':''}</div>
    <div class="priority-cell"><span class="priority-badge ${priorityClass}">${escapeHtml(task.priority)}</span></div>
    <div class="status-cell"><select class="status-select" aria-label="Change status for ${escapeHtml(task.title)}" data-action="status" data-id="${task.id}">${['To Do','In Progress','Completed'].map(s=>`<option ${task.status===s?'selected':''}>${s}</option>`).join('')}</select></div>
    <div class="row-actions"><button class="row-menu-btn" data-action="menu" data-id="${task.id}" aria-label="Actions for ${escapeHtml(task.title)}">···</button><div class="row-menu" data-menu="${task.id}" hidden><button data-action="edit" data-id="${task.id}">Edit task</button><button class="danger" data-action="delete" data-id="${task.id}">Delete task</button></div></div>
  </article>`;
}
function render() {
  updateStats();
  const list = filteredTasks();
  const filterNames = {'all':'Your tasks','To Do':'Tasks to do','In Progress':'In progress','Completed':'Completed tasks'};
  $('#list-title').childNodes[0].textContent = `${filterNames[state.filter]} `;
  $('#task-count').textContent = list.length;
  $('#list-footer-text').textContent = `${list.length} ${list.length===1?'task':'tasks'} shown`;
  document.querySelectorAll('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.filter === state.filter));
  if (!list.length) {
    const hasTasks = state.tasks.length > 0;
    els.list.innerHTML = `<div class="empty-state"><div class="empty-icon">${hasTasks?'⌕':'＋'}</div><strong>${hasTasks?'No matching tasks':'Your workspace is clear'}</strong><p>${hasTasks?'Try another search or filter to find a task.':'Add your first task and start building momentum.'}</p>${!hasTasks?'<button class="primary-button" id="empty-add">＋ Create your first task</button>':''}</div>`;
    $('#empty-add')?.addEventListener('click', () => openModal());
    return;
  }
  els.list.innerHTML = list.map(taskMarkup).join('');
}
function openModal(task = null) {
  els.form.reset(); els.error.textContent = ''; els.id.value = task?.id || '';
  els.modalTitle.textContent = task ? 'Edit your task' : 'Create a new task';
  els.save.innerHTML = task ? 'Save changes <span>→</span>' : 'Save task <span>→</span>';
  els.title.value = task?.title || ''; els.description.value = task?.description || ''; els.deadline.value = task?.deadline || '';
  els.priority.value = task?.priority || 'Medium'; els.status.value = task?.status || 'To Do';
  els.modal.hidden = false; document.body.style.overflow = 'hidden'; setTimeout(() => els.title.focus(), 50);
}
function closeModal() { els.modal.hidden = true; document.body.style.overflow = ''; }
async function saveTask(event) {
  event.preventDefault(); if (state.busy) return;
  const id = els.id.value;
  const payload = { title: els.title.value.trim(), description: els.description.value.trim(), deadline: els.deadline.value, priority: els.priority.value, status: els.status.value };
  if (!payload.title) { els.error.textContent = 'Please enter a task name.'; els.title.focus(); return; }
  state.busy = true; els.save.disabled = true; els.save.textContent = id ? 'Saving…' : 'Creating…';
  try {
    await api(id ? `/api/tasks/${id}` : '/api/tasks', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) });
    closeModal(); await loadTasks(); toast(id ? 'Task updated successfully.' : 'Task created successfully.');
  } catch (error) { els.error.textContent = error.message; }
  finally { state.busy = false; els.save.disabled = false; els.save.innerHTML = id ? 'Save changes <span>→</span>' : 'Save task <span>→</span>'; }
}
async function updateTask(id, changes) {
  try { await api(`/api/tasks/${id}`, { method:'PUT', body:JSON.stringify(changes) }); await loadTasks(); toast('Task updated.'); }
  catch (error) { toast(error.message); }
}
async function deleteTask(id) {
  const task = state.tasks.find(t => t.id === Number(id));
  if (!task || !window.confirm(`Delete “${task.title}”? This cannot be undone.`)) return;
  try { await api(`/api/tasks/${id}`, { method:'DELETE' }); await loadTasks(); toast('Task deleted.'); }
  catch (error) { toast(error.message); }
}
els.form.addEventListener('submit', saveTask);
$('#add-task-top').addEventListener('click', () => openModal());
$('#modal-close').addEventListener('click', closeModal); $('#cancel-modal').addEventListener('click', closeModal);
els.modal.addEventListener('click', event => { if (event.target === els.modal) closeModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !els.modal.hidden) closeModal(); });
document.querySelectorAll('.nav-item').forEach(button => button.addEventListener('click', () => { state.filter = button.dataset.filter; render(); if (window.innerWidth <= 780) $('#sidebar').classList.remove('open'); }));
$('#search-input').addEventListener('input', event => { state.search = event.target.value.trim(); render(); });
$('#priority-filter').addEventListener('change', event => { state.priority = event.target.value; render(); });
$('#sort-select').addEventListener('change', event => { state.sort = event.target.value; render(); });
$('#refresh-btn').addEventListener('click', () => loadTasks(true));
$('#clear-completed').addEventListener('click', async () => {
  const completed = state.tasks.filter(t => t.status === 'Completed');
  if (!completed.length) return toast('There are no completed tasks to clear.');
  if (!window.confirm(`Delete all ${completed.length} completed task(s)? This cannot be undone.`)) return;
  try { for (const task of completed) await api(`/api/tasks/${task.id}`, {method:'DELETE'}); await loadTasks(); toast('Completed tasks cleared.'); }
  catch (error) { toast(error.message); await loadTasks(); }
});
$('#mobile-menu').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
els.list.addEventListener('click', async event => {
  const button = event.target.closest('[data-action]'); if (!button) return;
  const { action, id } = button.dataset;
  if (action === 'menu') { const menu = els.list.querySelector(`[data-menu="${id}"]`); const wasHidden = menu.hidden; els.list.querySelectorAll('.row-menu').forEach(m => m.hidden = true); menu.hidden = !wasHidden; }
  if (action === 'edit') { const task = state.tasks.find(t => t.id === Number(id)); if (task) openModal(task); }
  if (action === 'delete') deleteTask(id);
  if (action === 'complete') updateTask(id, {status:button.checked?'Completed':'To Do'});
});
els.list.addEventListener('change', event => { const select = event.target.closest('[data-action="status"]'); if (select) updateTask(select.dataset.id, {status:select.value}); });
document.addEventListener('click', event => { if (!event.target.closest('.row-actions')) els.list.querySelectorAll('.row-menu').forEach(menu => menu.hidden = true); });
$('#today-label').textContent = new Date().toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});
loadTasks();
