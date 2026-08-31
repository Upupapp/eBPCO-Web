import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { SystemLogs } from './system-logs';

/**
 * What leaves the screen.
 *
 * System Logs is the most honest page in the portal on screen: four of its five
 * tabs are invented, and every one of them carries an unconditional notice
 * saying "nothing on this tab reflects real activity".
 *
 * That notice is bound to the screen. Export is not. A file called
 * `system-logs-security.csv` holding "Failed Login Attempt" and "Suspicious IP
 * Blocked" rows, with IP addresses and timestamps, is indistinguishable from a
 * real security log once it is in a folder or attached to an email — and an
 * LGU auditor reading one would have no way to know.
 *
 * These tests capture the download rather than mock the component's internals,
 * so they assert the bytes a person would actually open.
 */
interface Captured {
  name: string;
  text: string;
}

function mountAndCapture(): { logs: SystemLogs; files: Captured[] } {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [SystemLogs],
    providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
  });
  const fixture = TestBed.createComponent(SystemLogs);
  fixture.detectChanges();

  const files: Captured[] = [];
  const realCreate = URL.createObjectURL;
  const realRevoke = URL.revokeObjectURL;
  let pending = '';

  URL.createObjectURL = ((blob: Blob) => {
    // Blob.text() is async and the click is synchronous, so read the parts the
    // helper passed in rather than the Blob itself.
    pending = (blob as Blob & { __text?: string }).__text ?? '';
    return 'blob:stub';
  }) as typeof URL.createObjectURL;
  URL.revokeObjectURL = (() => undefined) as typeof URL.revokeObjectURL;

  const realBlob = globalThis.Blob;
  globalThis.Blob = class extends realBlob {
    __text: string;
    constructor(parts: BlobPart[], options?: BlobPropertyBag) {
      super(parts, options);
      this.__text = parts.map(String).join('');
    }
  } as unknown as typeof Blob;

  const realAppend = document.body.appendChild.bind(document.body);
  document.body.appendChild = ((node: Node) => {
    const el = node as HTMLAnchorElement;
    if (el.tagName === 'A' && el.download) {
      el.click = () => files.push({ name: el.download, text: pending });
    }
    return realAppend(node);
  }) as typeof document.body.appendChild;

  afterEach(() => {
    URL.createObjectURL = realCreate;
    URL.revokeObjectURL = realRevoke;
    globalThis.Blob = realBlob;
    document.body.appendChild = realAppend;
  });

  return { logs: fixture.componentInstance as unknown as SystemLogs, files };
}

type Testable = {
  selectTab(key: string): void;
  exportCurrentTab(): void;
};

describe('System Logs — export provenance', () => {
  it('marks a fabricated security export, in the filename and in every row', () => {
    const { logs, files } = mountAndCapture();
    const t = logs as unknown as Testable;

    t.selectTab('security');
    t.exportCurrentTab();

    expect(files.length).toBe(1);
    expect(files[0].name).toContain('SAMPLE');

    const lines = files[0].text.split('\r\n').filter((l) => l.length > 0);
    expect(lines[0].startsWith('dataSource')).toBe(true);
    // Every row, not merely a header a reader can scroll past.
    for (const line of lines.slice(1)) {
      expect(line).toContain('SAMPLE');
    }
  });

  it('leaves the real audit trail unmarked', () => {
    const { logs, files } = mountAndCapture();
    const t = logs as unknown as Testable;

    t.selectTab('activity');
    t.exportCurrentTab();

    // The activity tab IS a record of genuine actions. Marking it as sample
    // would be its own falsehood.
    if (files.length > 0) {
      expect(files[0].name).not.toContain('SAMPLE');
      expect(files[0].text).not.toContain('SAMPLE - not real activity');
    }
  });
});
