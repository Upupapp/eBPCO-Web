import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
  },
  {
    path: 'local-government',
    loadComponent: () =>
      import('./pages/local-government/local-government').then((m) => m.LocalGovernment),
  },
  {
    path: 'offices',
    loadComponent: () => import('./pages/offices/offices').then((m) => m.Offices),
  },
  {
    path: 'offices/:slug',
    loadComponent: () =>
      import('./pages/office-detail/office-detail').then((m) => m.OfficeDetail),
  },
  {
    path: 'permits',
    loadComponent: () => import('./pages/permits/permits').then((m) => m.Permits),
  },
  {
    path: 'permits/:slug',
    loadComponent: () =>
      import('./pages/permit-detail/permit-detail').then((m) => m.PermitDetail),
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
  },
  {
    path: 'privacy',
    loadComponent: () => import('./pages/privacy/privacy').then((m) => m.Privacy),
  },
  { path: '**', redirectTo: '' },
];
