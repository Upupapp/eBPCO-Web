import { Directive, ElementRef, HostListener, inject } from '@angular/core';

/**
 * The first letter of each word, uppercased — "juan dela cruz" becomes
 * "Juan Dela Cruz". Nothing else in the string is touched: a name typed as
 * "McDonald" or "DELA CRUZ" is left exactly as typed past its first letter,
 * because this is a courtesy for the common case (staff typing a name in
 * lowercase out of habit), not a claim that it knows how every name is
 * properly styled.
 *
 * `\p{L}` (Unicode letter), not `[a-z]`: this office serves names with ñ and
 * other accented letters, and a rule that only recognised the Latin
 * unaccented alphabet would silently skip exactly those.
 */
export function capitalizeName(value: string): string {
  return value.replace(/(^|[\s-])\p{L}/gu, (match) => match.toUpperCase());
}

/**
 * Applies `capitalizeName` to a text input when the officer leaves it (on
 * blur, not keystroke-by-keystroke) — see call sites for which fields these
 * are. Blur, specifically, because rewriting `input.value` while someone is
 * still typing fights the browser's own cursor position; there is nothing
 * to fight once the field is no longer focused.
 *
 * Applied only to genuine person-name fields (an applicant's name, a
 * claimant's name, a new user's full name) — never a business name, a role
 * name, or a login username, which may be legitimately stylized or
 * case-sensitive.
 */
@Directive({
  selector: 'input[appCapitalizeName]',
  standalone: true,
})
export class CapitalizeNameDirective {
  private readonly el = inject(ElementRef<HTMLInputElement>);

  @HostListener('blur')
  onBlur(): void {
    const input = this.el.nativeElement;
    const capitalized = capitalizeName(input.value);
    if (capitalized === input.value) return;
    input.value = capitalized;
    // Not `input.dispatchEvent(new Event('change'))`: ngModel listens for
    // 'input', and dispatching that is what makes the bound property (and
    // therefore anything else reading it, like a submit handler) see the
    // corrected value rather than just the DOM display.
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
}
