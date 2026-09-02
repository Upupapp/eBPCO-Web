import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ApplicationStore } from '../../core/domain/application-store';
import { API_BASE_URL } from '../../core/api/api.config';

/**
 * There is no upload path, and the portal must not imply otherwise.
 *
 * Raised by the mobile lane on 2 Sep, who asked whether a citizen uploading a
 * 20 MB plan set sees anything but a spinner, and whether a failed upload is
 * retried visibly. Checked here, and the answer is stranger than either: this
 * portal does not upload at all.
 *
 * Four `<input type="file">` exist — intake, payment proof, attach, resubmit —
 * and every handler keeps `file.name` and discards the bytes. There is no
 * `FormData`, no multipart, and no endpoint. The intake label said "File
 * Upload", the toast said "attached", and the payment form makes "Proof of
 * Payment" REQUIRED.
 *
 * So an officer recording a payment believed the receipt was held. Only its
 * filename was.
 */
describe('Documents: name recorded, file not sent', () => {
  let store: ApplicationStore;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        ApplicationStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '' },
      ],
    });
    store = TestBed.inject(ApplicationStore);
  });

  it('sends nothing to the server when a document is attached', () => {
    const app = store.applications()[0];
    store.attachDocument(app.id, 'req-1', 'Lot Plan', 'lot-plan.pdf', 'Engr. Tester');

    // The invariant that matters: attaching is a local record, not a transfer.
    // If an upload is ever added, this fails and somebody has to decide what
    // the officer should be told while it is in flight — which is exactly the
    // question the mobile lane asked.
    TestBed.inject(HttpTestingController).verify();
  });

  it('records the file name, which is all there is', () => {
    const app = store.applications()[0];
    store.attachDocument(app.id, 'req-1', 'Lot Plan', 'lot-plan.pdf', 'Engr. Tester');

    const doc = store
      .getDocuments(app.id)
      .find((d) => d.fileName === 'lot-plan.pdf');
    expect(doc).toBeDefined();
    expect(doc?.fileName).toBe('lot-plan.pdf');
  });
});
