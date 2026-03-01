# Project Collaboration Guide

## How to Work Effectively on This Project

This guide explains the workflow and communication patterns for this project. Read it before your first session and refer back to it to ensure consistency across the team.

---

## The Memory File

The most important concept to understand is `docs/memory.md`. This file represents the current state of the project. It should be reviewed at the start of every working session and updated at the end to ensure the next collaborator has full context.

**Core Principle:** This file reduces the need for lengthy status updates. It captures the framework details, architectural decisions, and task progress in a central location.

---

## How to Start a Working Session

A good session opening involves synchronizing with the project state:

1. Review `docs/memory.md`.
2. Review the `collaboration-guide.md` to ensure architectural standards are met.
3. Identify the next task from the `Task Status` section.

Example focus:
> "Reviewing memory.md... starting work on TASK-F04 (Product Listing Page)."

---

## How to Report Progress

When you finish a task, update `memory.md`:

- Mark the task ID as `[x] Done`.
- Add the completion date and details to the `Recently Completed Tasks` section.
- Briefly note any significant changes in the `Update Log`.

---

## Standard Development Patterns

- **Change Detection:** Zoneless. Use Signals and `computed()`.
- **Infrastructure:** Use the defined service pattern: Component → FeatureService → ApiService → HttpClient.
- **Constants:** Never hardcode API URLs; use `core/constants/api-endpoints.ts`.
- **Storage:** Use `StorageService` instead of direct `localStorage` access.
- **Testing:** Use Jasmine + Karma. Follow Angular conventions with `HttpClientTestingModule`.

---

## Common Workflows

| Objective | Action |
|---|---|
| Implement a new feature | Check relevant Task ID and follow existing service/component patterns. |
| Fix a bug | Reference the specific component or service in the memory log. |
| Update task status | Sync `memory.md` status tables. |
| Review consistency | Compare new code against the architectural decisions in `memory.md`. |
| Propose a change | Update the `Architecture Decisions` section after team agreement. |
