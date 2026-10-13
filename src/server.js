const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database(path.join(__dirname, '..', 'taskflow.db'));

db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    deadline TEXT DEFAULT '',
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK(priority IN ('Low','Medium','High')),
    status TEXT NOT NULL DEFAULT 'To Do' CHECK(status IN ('To Do','In Progress','Completed')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

const getAll = db.prepare('SELECT * FROM tasks ORDER BY CASE status WHEN \'To Do\' THEN 1 WHEN \'In Progress\' THEN 2 ELSE 3 END, CASE priority WHEN \'High\' THEN 1 WHEN \'Medium\' THEN 2 ELSE 3 END, deadline ASC, id DESC');
const getOne = db.prepare('SELECT * FROM tasks WHERE id = ?');
const allowedPriorities = ['Low', 'Medium', 'High'];
const allowedStatuses = ['To Do', 'In Progress', 'Completed'];

function validateTask(body, partial = false) {
  const errors = [];
  if (!partial || body.title !== undefined) {
    if (typeof body.title !== 'string' || !body.title.trim()) errors.push('A task title is required.');
    else if (body.title.trim().length > 150) errors.push('Title must be 150 characters or fewer.');
  }
  if (body.description !== undefined && (typeof body.description !== 'string' || body.description.length > 2000)) errors.push('Description must be 2,000 characters or fewer.');
  if (body.deadline !== undefined && body.deadline !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(body.deadline)) errors.push('Deadline must be a valid date in YYYY-MM-DD format.');
  if (body.priority !== undefined && !allowedPriorities.includes(body.priority)) errors.push('Priority must be Low, Medium, or High.');
  if (body.status !== undefined && !allowedStatuses.includes(body.status)) errors.push('Status must be To Do, In Progress, or Completed.');
  return errors;
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok', app: 'TaskFlow' }));
app.get('/api/tasks', (_req, res) => res.json(getAll.all()));
app.get('/api/tasks/:id', (req, res) => {
  const task = getOne.get(Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found.' });
  res.json(task);
});
app.post('/api/tasks', (req, res) => {
  const errors = validateTask(req.body || {});
  if (errors.length) return res.status(400).json({ error: errors[0], errors });
  const { title, description = '', deadline = '', priority = 'Medium', status = 'To Do' } = req.body;
  const result = db.prepare(`INSERT INTO tasks (title, description, deadline, priority, status) VALUES (?, ?, ?, ?, ?)`).run(title.trim(), description.trim(), deadline, priority, status);
  res.status(201).json(getOne.get(result.lastInsertRowid));
});
app.put('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = getOne.get(id);
  if (!existing) return res.status(404).json({ error: 'Task not found.' });
  const body = req.body || {};
  const errors = validateTask(body, true);
  if (errors.length) return res.status(400).json({ error: errors[0], errors });
  const updated = {
    title: body.title === undefined ? existing.title : body.title.trim(),
    description: body.description === undefined ? existing.description : body.description.trim(),
    deadline: body.deadline === undefined ? existing.deadline : body.deadline,
    priority: body.priority === undefined ? existing.priority : body.priority,
    status: body.status === undefined ? existing.status : body.status
  };
  db.prepare(`UPDATE tasks SET title = ?, description = ?, deadline = ?, priority = ?, status = ?, updated_at = datetime('now') WHERE id = ?`).run(updated.title, updated.description, updated.deadline, updated.priority, updated.status, id);
  res.json(getOne.get(id));
});
app.delete('/api/tasks/:id', (req, res) => {
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(Number(req.params.id));
  if (!result.changes) return res.status(404).json({ error: 'Task not found.' });
  res.json({ message: 'Task deleted successfully.' });
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'API endpoint not found.' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

app.listen(PORT, () => console.log(`TaskFlow is running at http://localhost:${PORT}`));
