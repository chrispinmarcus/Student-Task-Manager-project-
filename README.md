# TaskFlow — Student Task Manager

A beginner-friendly full-stack task manager built with HTML, CSS, vanilla JavaScript, Node.js, Express, and SQLite.

## Features

- Create, view, edit, and delete tasks (CRUD)
- Task deadlines, descriptions, priorities, and statuses
- Dashboard statistics and status navigation
- Search, filter by priority, and sort tasks
- Mark tasks complete with a checkbox or change status from a dropdown
- SQLite persistence (tasks remain after server restarts)
- Responsive desktop, tablet, and mobile layout
- Input validation, API error handling, and confirmation before deletion

## Requirements

- Node.js 20 or newer
- npm

## Run locally

1. Extract/open this project folder in VS Code.
2. Open a terminal in the project folder.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the application:

   ```bash
   npm start
   ```

5. Open **http://localhost:3000** in your browser.

The server automatically creates `taskflow.db` and the `tasks` table on first start. Your tasks are saved in that local database.

For automatic server restarts while developing, run `npm run dev`.

## API reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check server health |
| GET | `/api/tasks` | List tasks |
| GET | `/api/tasks/:id` | Get one task |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update a task or selected fields |
| DELETE | `/api/tasks/:id` | Delete a task |

Example create request body:

```json
{
  "title": "Finish database assignment",
  "description": "Complete the ER diagram and SQL queries.",
  "deadline": "2026-10-20",
  "priority": "High",
  "status": "To Do"
}
```

Allowed priorities: `Low`, `Medium`, `High`.

Allowed statuses: `To Do`, `In Progress`, `Completed`.

## Project structure

```text
taskflow/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── src/
│   └── server.js
├── .gitignore
├── package.json
└── README.md
```

## Team of four — suggested ownership

1. **Coordinator / UI-UX:** requirements, architecture diagram, wireframes, sprint tracking.
2. **Frontend developer:** HTML/CSS layout, dashboard, task form and status controls.
3. **Backend/database developer:** Express API, validation, SQLite schema, CRUD operations.
4. **Integration / QA / presenter:** GitHub setup, API integration, test cases, documentation, demo.

All members should review and test the integrated application together. Commit work in feature branches and use pull requests where possible.

## Sprint goal

Deliver a working MVP that lets a student create, view, edit, delete, prioritize, and update tasks from a responsive browser interface, with task data saved in SQLite and the core workflow tested.

## Scope note

This is a local learning prototype. It does not include user accounts, password authentication, cloud hosting, or multi-user permissions. Those can be added in a later sprint. Do not use it to store sensitive information.
