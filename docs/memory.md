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

**Phase 1 — Core Services. Category management and shared components in progress.**

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
[PHASE 1 INITIATED]
- Category feature files implemented (service, component, tests).
- Shared components (empty-state, spinner) and pipes (truncate, discount) in progress.
- All core configuration files are stable.
```

---

## Task Status

### Phase 0 — Setup (Must complete before any feature work)

| Task ID | Description | Owner | Status | PR |
|---------|-------------|-------|--------|----|
| TASK-F01 | Base HTTP Infrastructure + ApiService | Fathi | [x] Done | — |
| TASK-F02 | HTTP Interceptors (auth, error, loading) | Fathi | [x] Done | — |
| TASK-M01 | StorageService + AuthService | Mostafa | [x] Done | fix-m01-m02 |
| TASK-M02 | LoadingService + ToastService | Mostafa | [x] Done | fix-m01-m02 |
| TASK-I01 | Route Guards | Issac | [x] Done | — |
| TASK-I02 | TypeScript Model Files | Issac | [x] Done | — |
| TASK-K01 | App Routing Configuration | Mokhtar | [x] Done | task/k01 |
| TASK-M03 | Category Service & Management (Admin) | Mostafa | [x] Done | feature/category-managment |
| TASK-I03 | Review Service | Issac | [x] Done | task/i03-review-service |
| TASK-K07 | Login & Register Pages | Isaac | [x] Done | — |

---

## Recently Completed Tasks

| Task ID | Description | Owner | Date |
|---------|-------------|-------|------|
| TASK-I01 | Route Guards | Issac | 2026-03-02 |
| TASK-I02 | TypeScript Model Files | Issac | 2026-03-01 |
| TASK-F01 | Base HTTP Infrastructure + ApiService | Fathi | 2026-03-02 |
| TASK-F02 | HTTP Interceptors (auth, error, loading) | Fathi | 2026-03-02 |
| TASK-M01 | StorageService + AuthService | Mostafa | 2026-03-02 |
| TASK-M02 | LoadingService + ToastService | Mostafa | 2026-03-02 |
| TASK-K02 | Main Layout Component | Mokhtar | 2026-03-03 |
| TASK-K01 | App Routing Configuration | Mokhtar | 2026-03-03 |
| TASK-M03 | Category Service & Management | Mostafa | 2026-03-03 |
| TASK-K01 | App Routing Configuration | Mokhtar | 2026-03-02 |
| TASK-I03 | Review Service | Issac | 2026-03-03 |
| TASK-K07 | Login & Register Pages | Isaac | 2026-03-05 |
| TASK-I04 | Reviews Section Component | Isaac | 2026-03-07 |

---

## Currently In Progress

- _No tasks currently in progress._

---

## Blocked Tasks

_No blockers currently._

---

## Known Issues / Bugs

_None yet._

---

## Last Session Summary

- **Date:** 2026-03-07
- **Who:** Antigravity (Agent)
- **What was done:** Completed **[TASK-I05] Admin Layout + Dashboard**. Implemented a shared `SidebarNavComponent` with mobile drawer, a responsive `AdminLayout`, and the `DashboardComponent` featuring KPI cards and recent orders. Refined `AdminService` and API constants. Verified with a successful production build.
- **What is next:** Proceed with Phase 2 Admin management pages (Users, Orders, Banners).

---

## Update Log

| Date | Session | Change |
|------|---------|--------|
| 2026-02-28 | Scaffold | Initial project structure and configuration generated |
| 2026-03-01 | Maintenance | Documentation refactored; AI-specific terminology removed; collaboration guide renamed |
| 2026-03-01 | Task I02 | TypeScript Model Files completed by Issac |
| 2026-03-02 | Task M01/M02 | Storage, Auth, Loading, and Toast services completed + Zoneless tests fixed |
| 2026-03-02 | Task I01 | Route Guards completed by Issac |
| 2026-03-03 | Task M03 | Category Management and Empty State completed by Mostafa on branch `a` |
| 2026-03-03 | Docs | Missing Admin Category design spec added |
| 2026-03-03 | Task M03 | Category Management UI updated to match design spec (added description/slug) |
| 2026-03-03 | Build Fix | Resolved compilation errors and UI blowout in Categories component |
| 2026-03-03 | Task I03 | Review Service implemented and verified (TASK-I03) |
| 2026-03-03 | UX/Fix | Fixed label association accessibility error in Category Management |
| 2026-03-05 | Task K07 | Login & Register pages completed (TASK-K07) |
| 2026-03-07 | Task I04 | Reviews Section Component completed; PrimeNG removed, Tailwind design tokens applied, PrimaryButton refactored for variants, 10/10 tests passed |
| 2026-03-07 | Task I05 | Admin Layout & Dashboard completed; SidebarNav created, AdminService implemented, Responsive layout verified, Build passed |
