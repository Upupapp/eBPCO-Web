import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Applications } from './applications';
import { StaffApplicationsApi } from '../../core/api/staff-applications.api';

/**
 * "Preview" on a real, citizen-uploaded document must show the actual file,
 * not a fabricated placeholder.
 *
 * The Documents tab's preview modal drew the SAME decorative sheet for every
 * document regardless of what it actually was — a hardcoded "Date Uploaded:
 * Apr 14, 2021" and a "Document No." derived from `filename.length`, never
 * the real file. `StaffApplicationsApi` had no method at all for `GET
 * /documents/:id/content`, the signed-URL endpoint that already existed and
 * was already used correctly by the User Portal's own document preview.
 * "Download" exported a CSV describing the file's metadata rather than the
 * file itself.
 */
describe('Applications — previewing a real, citizen-uploaded document', () => {
  function mount(applicationsApi: Partial<StaffApplicationsApi>) {
    TestBed.configureTestingModule({
      imports: [Applications],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: StaffApplicationsApi,
          useValue: { page: () => Promise.resolve({ rows: [], nextCursor: null }), ...applicationsApi },
        },
      ],
    });
    const fixture = TestBed.createComponent(Applications);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  const MOUNT_BUDGET = 20_000;

  const realRow = {
    requirementId: 'req-1',
    label: 'Land Title',
    required: true,
    departmentName: 'Records',
    isReal: true,
    doc: {
      id: 'doc-real-1',
      fileName: 'land-title.pdf',
      status: 'Uploaded',
      remarks: null,
      uploadedAt: '2026-09-01T00:00:00.000Z',
      contentType: 'application/pdf',
    },
  };

  afterEach(() => TestBed.resetTestingModule());

  it('fetches the real signed content instead of drawing the fabricated placeholder sheet', async () => {
    const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 9, 9]);
    const page = mount({
      documentContent: () => Promise.resolve({ kind: 'ok', url: 'https://signed.example/land-title.pdf' }),
    });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => new Response(bytes, { status: 200 })) as typeof fetch;
    try {
      (page as unknown as { previewDocumentRow(r: typeof realRow): void }).previewDocumentRow(realRow);
      // Let the two chained microtask hops (documentContent(), then fetch()) settle.
      await new Promise((resolve) => setTimeout(resolve, 0));
      await new Promise((resolve) => setTimeout(resolve, 0));
      await new Promise((resolve) => setTimeout(resolve, 0));
    } finally {
      globalThis.fetch = originalFetch;
    }

    const preview = (page as unknown as {
      previewItem(): { real: { objectUrl: string; contentType: string } | null; loading: boolean } | null;
    }).previewItem();
    expect(preview).not.toBeNull();
    expect(preview!.loading).toBe(false);
    expect(preview!.real).not.toBeNull();
    expect(preview!.real!.contentType).toBe('application/pdf');
  }, MOUNT_BUDGET);

  it('types the preview from the bytes, not the label — HTML calling itself a PDF is not framed as one', async () => {
    // The document row says application/pdf; the bytes are an HTML page. The
    // preview frame has no sandbox (Chrome's PDF viewer will not run in one),
    // so the ONLY thing keeping a mislabeled HTML file from executing as the
    // signed-in officer is that the Blob is typed from its magic number. Here
    // that yields nothing showable, so the template offers Download instead.
    const bytes = new TextEncoder().encode('<!doctype html><script>alert(1)</script>');
    const page = mount({
      documentContent: () => Promise.resolve({ kind: 'ok', url: 'https://signed.example/land-title.pdf' }),
    });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => new Response(bytes, { status: 200 })) as typeof fetch;
    try {
      (page as unknown as { previewDocumentRow(r: typeof realRow): void }).previewDocumentRow(realRow);
      for (let i = 0; i < 6; i++) await Promise.resolve();
      await new Promise((r) => setTimeout(r, 50));
    } finally {
      globalThis.fetch = originalFetch;
    }
    const preview = (page as unknown as { previewItem(): { real: { contentType: string } | null } | null }).previewItem();
    expect(preview!.real!.contentType).toBe('application/octet-stream');
  }, MOUNT_BUDGET);

  it('still shows the placeholder sheet for a local-demo document, which has no real bytes', async () => {
    const page = mount({});
    const demoRow = { ...realRow, isReal: false, doc: { ...realRow.doc, contentType: undefined } };

    (page as unknown as { previewDocumentRow(r: typeof demoRow): void }).previewDocumentRow(demoRow);

    const preview = (page as unknown as {
      previewItem(): { real: unknown; loading: boolean } | null;
    }).previewItem();
    expect(preview).not.toBeNull();
    expect(preview!.loading).toBe(false);
    expect(preview!.real).toBeNull();
  }, MOUNT_BUDGET);

  it('reports a real failure with a toast rather than silently keeping a stuck loading state', async () => {
    const page = mount({
      documentContent: () => Promise.resolve({ kind: 'failed', message: 'network down' }),
    });

    (page as unknown as { previewDocumentRow(r: typeof realRow): void }).previewDocumentRow(realRow);
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));

    const preview = (page as unknown as { previewItem(): unknown }).previewItem();
    expect(preview).toBeNull();
  }, MOUNT_BUDGET);
});
