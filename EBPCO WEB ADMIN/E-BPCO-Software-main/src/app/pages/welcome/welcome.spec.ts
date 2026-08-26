import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Welcome } from './welcome';

describe('Welcome', () => {
  let nativeElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Welcome],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(Welcome);
    fixture.detectChanges();
    nativeElement = fixture.nativeElement;
  });

  it('identifies the system as E-BPCO Administration in its one <h1>', () => {
    const h1s = nativeElement.querySelectorAll('h1');
    expect(h1s.length).toBe(1);
    expect(h1s[0].textContent?.trim()).toBe('Welcome to E-BPCO Administration');
  });

  it('states this is authorized-personnel access', () => {
    expect(nativeElement.textContent).toContain('Authorized Personnel Access');
    expect(nativeElement.textContent).toContain('For authorized municipal personnel only');
  });

  it('has exactly one link, and it goes to /login', () => {
    const links = Array.from(nativeElement.querySelectorAll('a')) as HTMLAnchorElement[];
    expect(links.length).toBe(1);
    expect(links[0].getAttribute('href')).toBe('/login');
  });

  it('names the correct municipality and office, not the design-inspiration placeholder', () => {
    const text = nativeElement.textContent ?? '';
    expect(text).toContain('Municipality of Castilla');
    expect(text).toContain('Province of Sorsogon');
    expect(text).toContain('Electronic Building Permit and Certificate of Occupancy');
    expect(text).not.toContain('Esperanza');
  });

  it('shows no citizen-facing portal choice or public account creation', () => {
    const text = nativeElement.textContent ?? '';
    expect(text).not.toContain('Citizen Portal');
    expect(text.toLowerCase()).not.toContain('create a citizen account');
    expect(text.toLowerCase()).not.toContain('citizen account');
  });

  it('renders a dynamic copyright year, not a hardcoded one', () => {
    const year = new Date().getFullYear();
    expect(nativeElement.querySelector('.welcome-footer')?.textContent).toContain(String(year));
  });

  it('uses exactly one <main> landmark', () => {
    expect(nativeElement.querySelectorAll('main').length).toBe(1);
  });
});
