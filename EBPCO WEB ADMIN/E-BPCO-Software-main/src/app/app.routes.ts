import { Routes } from '@angular/router';
import { authGuard } from './core/session/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/splash/splash').then((m) => m.Splash),
  },
  {
    path: 'welcome',
    loadComponent: () => import('./pages/welcome/welcome').then((m) => m.Welcome),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then((m) => m.Register),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/reset-password/reset-password').then((m) => m.ResetPassword),
  },

  // One authenticated shell, one sidebar, canonical resource-identifying
  // URLs — no `/tenant` prefix. Every child is guarded: no session -> back
  // to /login; a session whose role isn't authorized for that module ->
  // back to /dashboard (see core/session/auth.guard.ts and
  // core/session/permissions.ts, the single registry both this guard and
  // the sidebar read from).
  {
    path: '',
    loadComponent: () => import('./layout/admin-layout/admin-layout').then((m) => m.AdminLayout),
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'applications',
        loadComponent: () =>
          import('./pages/applications/applications').then((m) => m.Applications),
      },
      {
        // Canonical Application Detail Workspace route — shared by every
        // surface that opens a specific application (this page's own
        // table, Dashboard, the Business Stages board, Evaluations,
        // Payments, Permit Release). Reusing the same component/path
        // everywhere means there's exactly one detail experience,
        // reachable by a stable, refreshable, linkable URL.
        path: 'applications/:id',
        loadComponent: () =>
          import('./pages/applications/applications').then((m) => m.Applications),
      },
      {
        // The same record, opened to WORK on it (View vs Edit, 2026-09-26):
        // decisions, document review, fees, the permit and notes. The plain
        // `:id` route above is the read-only record. `mode` reaches the
        // component as an input through withComponentInputBinding.
        path: 'applications/:id/edit',
        loadComponent: () =>
          import('./pages/applications/applications').then((m) => m.Applications),
        data: { mode: 'edit' },
      },
      {
        path: 'evaluations',
        loadComponent: () => import('./pages/evaluations/evaluations').then((m) => m.Evaluations),
      },
      {
        path: 'payments',
        loadComponent: () => import('./pages/payments/payments').then((m) => m.Payments),
      },
      {
        path: 'permit-release',
        loadComponent: () =>
          import('./pages/permit-release/permit-release').then((m) => m.PermitRelease),
      },
      {
        path: 'businesses',
        loadComponent: () => import('./pages/businesses/businesses').then((m) => m.Businesses),
      },
      {
        path: 'citizens',
        loadComponent: () => import('./pages/citizens/citizens').then((m) => m.Citizens),
      },
      {
        // Same shape as `applications/:id` above: one component serving
        // both the list and the detail workspace, reached by two route
        // registrations rather than an in-page view toggle, so a citizen's
        // detail screen is a stable, refreshable, linkable URL.
        path: 'citizens/:id',
        loadComponent: () => import('./pages/citizens/citizens').then((m) => m.Citizens),
      },
      {
        path: 'archive',
        loadComponent: () => import('./pages/archive/archive').then((m) => m.Archive),
      },
      {
        path: 'access-requests',
        loadComponent: () =>
          import('./pages/access-requests/access-requests').then((m) => m.AccessRequests),
      },
      {
        path: 'user-roles',
        loadComponent: () => import('./pages/user-roles/user-roles').then((m) => m.UserRoles),
      },
      {
        path: 'workflow',
        loadComponent: () => import('./pages/workflow/workflow').then((m) => m.Workflow),
      },
      {
        path: 'system-logs',
        loadComponent: () => import('./pages/system-logs/system-logs').then((m) => m.SystemLogs),
      },

      // ---- Legacy migration aliases -----------------------------------
      // Temporary redirects for one release so old bookmarks/links still
      // land somewhere real. These are the ONLY places `/tenant` may
      // appear in the route table — every one of them redirects away
      // from it immediately; nothing renders under a `/tenant` path.
      { path: 'tenant', redirectTo: 'dashboard' },
      { path: 'tenant/dashboard', redirectTo: 'dashboard' },
      { path: 'tenant/applications', redirectTo: 'applications' },
      { path: 'tenant/applications/:id', redirectTo: 'applications/:id' },
      { path: 'tenant/evaluations', redirectTo: 'evaluations' },
      { path: 'tenant/payments', redirectTo: 'payments' },
      { path: 'tenant/permit-release', redirectTo: 'permit-release' },
      { path: 'tenant/workflow', redirectTo: 'workflow' },
      { path: 'tenants', redirectTo: 'businesses' },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
