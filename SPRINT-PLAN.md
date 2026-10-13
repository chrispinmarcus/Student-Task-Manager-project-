# TaskFlow Sprint Plan

**Team:** 4 students  
**Level:** Beginner  
**Duration:** 7 days  
**Sprint goal:** Deliver a working TaskFlow MVP that lets a student manage tasks through a browser interface, with data saved in SQLite.

## Backlog

| ID | Task | Owner | Priority | Estimate |
|---|---|---|---|---:|
| T1 | Agree requirements and user stories | Member 1 | High | 2 SP |
| T2 | Draw architecture and data model | Member 1 | High | 2 SP |
| T3 | Create wireframes and UI design | Member 1 | High | 3 SP |
| T4 | Set up GitHub repository and project structure | Member 4 | High | 1 SP |
| T5 | Configure Node.js and Express | Member 3 | High | 2 SP |
| T6 | Create database and tasks table | Member 3 | High | 3 SP |
| T7 | Build CRUD API endpoints | Member 3 | High | 5 SP |
| T8 | Build responsive task dashboard and form | Member 2 | High | 5 SP |
| T9 | Connect frontend to backend API | Members 2 and 4 | High | 3 SP |
| T10 | Add task status and priority controls | Member 2 | High | 3 SP |
| T11 | Test workflow and fix bugs | Member 4, all members | High | 3 SP |
| T12 | Prepare demo and presentation | Member 4, all members | Medium | 2 SP |

Estimates are initial discussion points, not promises. Re-estimate together after the team understands the work.

## Seven-day plan

- **Day 1:** Requirements, user stories, wireframes, architecture, GitHub setup.
- **Day 2:** Express setup, database schema, initial frontend shell.
- **Days 3–4:** Build CRUD APIs and responsive frontend in parallel.
- **Day 5:** Integrate frontend, API, and database; finish status/priority controls.
- **Day 6:** Test create/read/update/delete, validation, filters, and persistence; fix bugs.
- **Day 7:** Sprint review, demo, presentation, and retrospective.

## Definition of Done

- Feature implemented and reviewed.
- Works with the integrated application.
- Relevant test completed and bugs recorded.
- Code committed to GitHub.
- Setup instructions updated when needed.

## Architecture

```text
Student
   ↕
Frontend: HTML + CSS + JavaScript
   ↕ HTTP / JSON
Backend: Node.js + Express REST API
   ↕ SQL queries
SQLite database (taskflow.db)
```

SQLite is used in this runnable starter so teammates can start locally without setting up a separate database server. The architecture and SQL layer can be adapted to MySQL if required by the lecturer.
