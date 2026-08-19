import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Splash } from './splash';

describe('Splash', () => {
  let router: Router;
  let navigateByUrlSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Splash],
      providers: [provideRouter([])],
    }).compileComponents();
    router = TestBed.inject(Router);
    navigateByUrlSpy = vi.spyOn(router, 'navigateByUrl');
  });

  function render() {
    const fixture = TestBed.createComponent(Splash);
    fixture.detectChanges();
    return fixture;
  }

  it('does not navigate on an unrelated animationend event', () => {
    const fixture = render();
    fixture.componentInstance['onAnimationEnd']({ animationName: 'logo-spin' } as AnimationEvent);
    expect(navigateByUrlSpy).not.toHaveBeenCalled();
  });

  it('navigates to /welcome, with replaceUrl, once the splash-reveal animation ends', () => {
    const fixture = render();
    fixture.componentInstance['onAnimationEnd']({
      animationName: 'splash-reveal',
    } as AnimationEvent);
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/welcome', { replaceUrl: true });
  });

  // Angular's emulated view encapsulation scopes `@keyframes` names with a
  // generated `_ngcontent-*`-style suffix at runtime, so the handler
  // deliberately matches with `endsWith` rather than `===` — this guards
  // against a regression back to an exact-match check that would silently
  // stop firing.
  it('still matches a scoped/suffixed animation name via endsWith', () => {
    const fixture = render();
    fixture.componentInstance['onAnimationEnd']({
      animationName: 'ng-tns-c123-4_splash-reveal',
    } as AnimationEvent);
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/welcome', { replaceUrl: true });
  });

  it('restores body scroll on destroy', () => {
    const fixture = render();
    expect(document.body.style.overflow).toBe('hidden');
    fixture.destroy();
    expect(document.body.style.overflow).toBe('');
  });
});
