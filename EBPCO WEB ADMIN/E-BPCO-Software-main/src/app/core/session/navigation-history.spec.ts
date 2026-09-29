import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { NavigationHistory, labelFor } from './navigation-history';

@Component({ template: '' })
class Blank {}

describe('NavigationHistory', () => {
  let router: Router;
  let history: NavigationHistory;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: '**', component: Blank }])] });
    router = TestBed.inject(Router);
    history = TestBed.inject(NavigationHistory);
  });

  it('knows the screen an application was opened from', async () => {
    await router.navigateByUrl('/dashboard');
    await router.navigateByUrl('/applications/abc');
    expect(history.previous()).toBe('/dashboard');
    expect(history.previousLabel('Applications')).toBe('Dashboard');
  });

  it('falls back when there is no screen before this one', async () => {
    await router.navigateByUrl('/applications/abc');
    expect(history.previous()).toBeNull();
    expect(history.previousLabel('Applications')).toBe('Applications');
  });

  it('never goes back to the sign-in page', async () => {
    await router.navigateByUrl('/login');
    await router.navigateByUrl('/dashboard');
    expect(history.previous()).toBeNull();
  });

  it('a replaced screen takes the place of the one before it', async () => {
    await router.navigateByUrl('/dashboard');
    await router.navigateByUrl('/teams');
    await router.navigateByUrl('/user-roles?tab=teams', { replaceUrl: true });
    await router.navigateByUrl('/applications/abc');
    expect(history.previousLabel('Applications')).toBe('Teams');
  });
});

describe('labelFor', () => {
  it('names detail screens and list screens', () => {
    expect(labelFor('/applications/abc')).toBe('Application');
    expect(labelFor('/applications/abc/edit')).toBe('Application');
    expect(labelFor('/applications?status=Draft')).toBe('Applications');
    expect(labelFor('/citizens/42')).toBe('Citizen');
    expect(labelFor('/teams')).toBe('My Team');
    expect(labelFor('/evaluations?stage=zoning')).toBe('Evaluations');
    expect(labelFor('/somewhere-else')).toBeNull();
  });
});
