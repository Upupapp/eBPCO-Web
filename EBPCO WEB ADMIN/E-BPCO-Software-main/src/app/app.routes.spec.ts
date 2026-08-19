import { Route } from '@angular/router';
import { routes } from './app.routes';

// Canonical routes this consolidation introduced — every one must resolve
// under the single guarded AdminLayout parent, not a second `/tenant` tree.
const CANONICAL_PATHS = [
  'dashboard',
  'applications',
  'applications/:id',
  'evaluations',
  'payments',
  'permit-release',
  'businesses',
  'user-roles',
  'workflow',
  'system-logs',
];

// Legacy alias -> canonical target, as specified by the migration.
const LEGACY_REDIRECTS: [string, string][] = [
  ['tenant', 'dashboard'],
  ['tenant/dashboard', 'dashboard'],
  ['tenant/applications', 'applications'],
  ['tenant/applications/:id', 'applications/:id'],
  ['tenant/evaluations', 'evaluations'],
  ['tenant/payments', 'payments'],
  ['tenant/permit-release', 'permit-release'],
  ['tenant/workflow', 'workflow'],
  ['tenants', 'businesses'],
];

function findAdminLayoutRoute(): Route {
  const admin = routes.find((r) => r.path === '' && Array.isArray(r.children));
  if (!admin) throw new Error('Could not find the guarded AdminLayout parent route');
  return admin;
}

describe('app.routes /welcome (splash -> welcome -> login gateway)', () => {
  it('registers a public, lazy-loaded /welcome route', () => {
    const welcome = routes.find((r) => r.path === 'welcome');
    expect(welcome).toBeTruthy();
    expect(welcome?.loadComponent).toBeTruthy();
  });

  it('does not sit under the guarded AdminLayout parent', () => {
    const admin = findAdminLayoutRoute();
    const children = admin.children ?? [];
    expect(children.some((c) => c.path === 'welcome')).toBe(false);
  });

  it('carries no canActivate guard of its own', () => {
    const welcome = routes.find((r) => r.path === 'welcome');
    expect(welcome?.canActivate).toBeFalsy();
  });

  it('keeps /login registered as a top-level route, reachable directly', () => {
    const login = routes.find((r) => r.path === 'login');
    expect(login).toBeTruthy();
    expect(login?.loadComponent).toBeTruthy();
    expect(login?.canActivate).toBeFalsy();
  });
});

describe('app.routes canonical route map', () => {
  const admin = findAdminLayoutRoute();
  const children = admin.children ?? [];

  it('guards the AdminLayout parent with authGuard', () => {
    expect(admin.canActivate?.length).toBeGreaterThan(0);
    expect(admin.canActivateChild?.length).toBeGreaterThan(0);
  });

  for (const path of CANONICAL_PATHS) {
    it(`registers canonical route "${path}"`, () => {
      const match = children.find((c) => c.path === path);
      expect(match).toBeTruthy();
      expect(match?.loadComponent).toBeTruthy();
    });
  }

  it('has exactly one route entry per canonical path (no duplicates)', () => {
    for (const path of CANONICAL_PATHS) {
      const matches = children.filter((c) => c.path === path);
      expect(matches.length).toBe(1);
    }
  });
});

describe('app.routes legacy /tenant redirects', () => {
  const admin = findAdminLayoutRoute();
  const children = admin.children ?? [];

  for (const [legacyPath, target] of LEGACY_REDIRECTS) {
    it(`redirects "${legacyPath}" -> "${target}"`, () => {
      const match = children.find((c) => c.path === legacyPath);
      expect(match).toBeTruthy();
      expect(match?.redirectTo).toBe(target);
      // A redirect entry must never also carry a component — it should
      // never render a second version of a page under the legacy path.
      expect(match?.loadComponent).toBeFalsy();
    });
  }

  it('preserves the :id param in the applications detail redirect', () => {
    const match = children.find((c) => c.path === 'tenant/applications/:id');
    expect(match?.redirectTo).toBe('applications/:id');
  });

  it('contains no route whose redirectTo target itself starts with tenant/', () => {
    for (const child of children) {
      if (child.redirectTo) {
        expect(String(child.redirectTo).startsWith('tenant')).toBe(false);
      }
    }
  });
});

describe('no /tenant path leaks outside the deliberate legacy alias block', () => {
  it('every child route whose own path contains "tenant" is a redirect-only alias', () => {
    const admin = findAdminLayoutRoute();
    const children = admin.children ?? [];
    const tenantPathed = children.filter((c) => c.path?.includes('tenant') || c.path === 'tenants');
    expect(tenantPathed.length).toBeGreaterThan(0); // the aliases themselves should exist
    for (const child of tenantPathed) {
      expect(child.redirectTo).toBeTruthy();
      expect(child.loadComponent).toBeFalsy();
    }
  });
});
