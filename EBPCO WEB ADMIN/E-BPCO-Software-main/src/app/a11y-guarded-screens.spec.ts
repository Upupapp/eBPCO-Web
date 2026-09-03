import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import axe from 'axe-core';

import { routes } from './app.routes';

import { Dashboard } from './pages/dashboard/dashboard';
import { Applications } from './pages/applications/applications';
import { Evaluations } from './pages/evaluations/evaluations';
import { Payments } from './pages/payments/payments';
import { PermitRelease } from './pages/permit-release/permit-release';
import { Businesses } from './pages/businesses/businesses';
import { Archive } from './pages/archive/archive';
import { AccessRequests } from './pages/access-requests/access-requests';
import { UserRoles } from './pages/user-roles/user-roles';
import { Workflow } from './pages/workflow/workflow';
import { SystemLogs } from './pages/system-logs/system-logs';

/**
 * Accessibility of the twelve screens behind authGuard.
 *
 * WHY THIS EXISTS, AND WHY IT IS NOT check-a11y.mjs
 *
 * The citizen web portal lane, 3 September: their browser sweep visited 17
 * screens, reported the portal clean, and never reached /permits/apply -- where
 * 22 unnamed file pickers sat. Screens behind a journey are the easiest to omit
 * and the most consequential, because that is where the real work happens.
 *
 * The same hole was here, and worse: check-a11y.mjs reached 4 of 16 routes. The
 * other twelve need a server-validated session, authGuard no longer mints one,
 * and the seeded account requires a second factor no gate should fabricate. So
 * the browser sweep cannot reach the screens where officers review, decide and
 * release permits -- which is the half that matters.
 *
 * A component mount can reach them, because the guard is a router concern and
 * this bypasses the router. So it does.
 *
 * WHAT THIS CANNOT SEE, SAID PLAINLY
 *
 * jsdom does no layout. Every rule that needs a computed box or a rendered
 * colour -- contrast, target size, focus order, reflow -- returns "incomplete"
 * here and is NOT evidence of anything. What it does see is naming, roles, ARIA
 * validity and structure, which is the class the citizen lane's file pickers
 * fell into and the class this portal's 56 unnamed controls fell into.
 *
 * So: this is not a replacement for the browser sweep at four widths and two
 * engines. It is the half of the truth obtainable without a session, and it
 * stops twelve screens being simply unmeasured.
 */
const SCREENS: ReadonlyArray<{ route: string; component: unknown }> = [
  { route: 'dashboard', component: Dashboard },
  { route: 'applications', component: Applications },
  { route: 'applications/:id', component: Applications },
  { route: 'evaluations', component: Evaluations },
  { route: 'payments', component: Payments },
  { route: 'permit-release', component: PermitRelease },
  { route: 'businesses', component: Businesses },
  { route: 'archive', component: Archive },
  { route: 'access-requests', component: AccessRequests },
  { route: 'user-roles', component: UserRoles },
  { route: 'workflow', component: Workflow },
  { route: 'system-logs', component: SystemLogs },
];

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

describe('accessibility of the screens behind authGuard', () => {
  /**
   * The denominator, derived rather than typed. A screen added to the guarded
   * block tomorrow and not added here would otherwise be silently unmeasured --
   * which is the whole defect this file exists to answer.
   */
  it('covers every guarded route in app.routes.ts', () => {
    // The routes ARRAY, not its source text. A regex over the file would have
    // been one rename away from silently matching nothing, and a denominator
    // that quietly becomes zero is the exact failure this guards against.
    const guarded = routes.find((r) => r.canActivate !== undefined);
    expect(guarded, 'no route in app.routes.ts declares canActivate').toBeDefined();

    const declared = (guarded?.children ?? [])
      .filter((child) => child.redirectTo === undefined)   // an alias, not a screen
      .map((child) => child.path)
      .filter((path): path is string => path !== undefined && path !== '');

    expect([...new Set(declared)].sort()).toEqual([...new Set(SCREENS.map((s) => s.route))].sort());
  });

  for (const screen of SCREENS) {
    it(`${screen.route} has no violation a component mount can detect`, async () => {
      TestBed.configureTestingModule({
        providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
      });
      const fixture = TestBed.createComponent(screen.component as never);
      fixture.detectChanges();

      const results = await axe.run(fixture.nativeElement as HTMLElement, {
        runOnly: { type: 'tag', values: WCAG },
      });

      const detail = results.violations
        .map((v) => `${v.id} (${v.nodes.length}) — ${v.help}\n      ${v.nodes[0]?.html?.slice(0, 120)}`)
        .join('\n    ');
      expect(results.violations, `\n    ${screen.route}:\n    ${detail}\n`).toEqual([]);
      // axe walks the entire rendered tree and these screens are large tables.
      // The default 30s budget is not a statement about this code so much as
      // about the machine: this Mac is shared, and a neighbouring Flutter build
      // has taken the dashboard mount past 30s while nothing here changed. A
      // timeout is indistinguishable from a defect in the report, so the budget
      // is set where load cannot manufacture a false failure.
    }, 120_000);
  }
});
