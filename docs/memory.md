# Project Memory File

> ⚠️ INSTRUCTION: Read this file at the start of EVERY session before doing anything else.
> Update this file at the end of EVERY session after any change.
> This file is the single source of truth for the project state.

---

## Project Identity

- **Project name:** Angular Ecommerce Client
- **Framework:** Angular (latest), Zoneless with Signals
- **Styling:** Tailwind CSS + PrimeNG + PrimeFlex
- **Language:** TypeScript (strict mode)
- **Testing:** Jasmine + Karma (Angular default)
- **Backend base URL (dev):** http://localhost:3000
- **Repository:** [ADD GITHUB REPO URL WHEN CREATED]

## Team Members & Ownership

| Member | Domain | Task IDs |
|--------|--------|----------|
| Fathi | Cart & Products | TASK-F01 through TASK-F08 |
| Mostafa | Orders, Checkout, Categories | TASK-M01 through TASK-M08 |
| Issac | Reviews & Admin Panel | TASK-I01 through TASK-I08 |
| Mokhtar | Wishlist, Seller, Routing | TASK-K01 through TASK-K07 |

---

## Current Project Phase

**Phase 0 — Project Scaffolded. No features implemented yet.**

---

## Architecture Decisions (Do Not Change Without Team Agreement)

- All HTTP calls go through: Component → FeatureService → ApiService → HttpClient
- API URLs are constants in `core/constants/api-endpoints.ts` — never hardcoded
- LocalStorage is only accessed through `StorageService` — never directly
- User state (currentUser, isLoggedIn, role) is managed exclusively by `AuthService` via signals
- Interceptors are global and registered in `app.config.ts` — never added per-service
- Change detection: zoneless. Use signals and computed(). Never use markForCheck() or detectChanges() directly.
- All new components are standalone (no NgModules)

---

## File Structure State

```
[SCAFFOLD COMPLETE]
All folders created with .gitkeep.
Configuration files generated and committed.
No feature files exist yet.
```

---

## Task Status

### Phase 0 — Setup (Must complete before any feature work)

| Task ID | Description | Owner | Status | PR |
|---------|-------------|-------|--------|----|
| TASK-F01 | Base HTTP Infrastructure + ApiService | Fathi | [x] Done | — |
| TASK-F02 | HTTP Interceptors (auth, error, loading) | Fathi | [x] Done | — |
| TASK-M01 | StorageService + AuthService | Mostafa | [x] Done | — |
| TASK-M02 | LoadingService + ToastService | Mostafa | [x] Done | — |
| TASK-I01 | Route Guards | Issac | [ ] Not started | — |
| TASK-I02 | TypeScript Model Files | Issac | [x] Done | — |
| TASK-K01 | App Routing Configuration | Mokhtar | [ ] Not started | — |

---

## Recently Completed Tasks

| Task ID | Description | Owner | Date |
|---------|-------------|-------|------|
| TASK-I02 | TypeScript Model Files | Issac | 2026-03-01 |

---

## Currently In Progress

_Nothing in progress. Awaiting team to begin Phase 0 tasks._

---

## Blocked Tasks

_No blockers currently._

---

## Known Issues / Bugs

_None yet._

---

## Last Session Summary

- **Date:** 2026-03-02
- **Who:** Fathi
- **What was done:** Fixed import errors in `app.config.ts` by implementing `StorageService`, `AuthService`, and `ToastService` stubs. Improved `error.interceptor.ts` and `loading.interceptor.ts`. Added full unit tests for base HTTP infrastructure.
- **What is next:** Proceed with Phase 0 tasks for Issac (Route Guards and TypeScript Model Files).

---

## Update Log

| Date | Session | Change |
|------|---------|--------|
| 2026-02-28 | Scaffold | Initial project structure and configuration generated |
| 2026-03-01 | Maintenance | Documentation refactored; AI-specific terminology removed; collaboration guide renamed |
| 2026-03-01 | Task I02 | TypeScript Model Files completed by Issac |
