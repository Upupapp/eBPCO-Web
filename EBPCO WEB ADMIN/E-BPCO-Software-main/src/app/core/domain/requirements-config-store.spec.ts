import { TestBed } from '@angular/core/testing';
import { RequirementsConfigStore } from './requirements-config-store';
import { requirementsFor, stageOf } from './requirements-catalog';
import { RequirementDocumentDto, RequirementsApi } from '../api/requirements.api';
import { ALL_PERMIT_TYPES } from './permit.model';

describe('RequirementsConfigStore', () => {
  let store: RequirementsConfigStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [RequirementsConfigStore] });
    store = TestBed.inject(RequirementsConfigStore);
  });

  it('seeds every permit type from the static catalog, unmodified, at construction', () => {
    for (const type of ALL_PERMIT_TYPES) {
      expect(store.documentsFor(type)).toEqual(requirementsFor(type).documents);
    }
  });

  it('addDocument appends a new document with a real generated id, without touching existing rows', () => {
    const before = store.documentsFor('Building Permit').length;
    const created = store.addDocument('Building Permit', {
      label: 'Notarized Deed of Sale',
      required: true,
      reviewingDepartmentId: 'obo',
    });
    const after = store.documentsFor('Building Permit');
    expect(after.length).toBe(before + 1);
    expect(created.id).toBeTruthy();
    expect(after.some((d) => d.id === created.id && d.label === 'Notarized Deed of Sale')).toBe(
      true,
    );
  });

  it('addDocument only affects the permit type it was added to', () => {
    const beforeElectrical = store.documentsFor('Electrical Permit').length;
    store.addDocument('Building Permit', {
      label: 'Extra Document',
      required: false,
      reviewingDepartmentId: 'obo',
    });
    expect(store.documentsFor('Electrical Permit').length).toBe(beforeElectrical);
  });

  it('updateDocument patches only the matching document, leaving the rest untouched', () => {
    const original = store.documentsFor('Building Permit');
    const target = original[0];
    store.updateDocument('Building Permit', target.id, { label: 'Updated Label' });
    const updated = store.documentsFor('Building Permit');
    expect(updated[0].label).toBe('Updated Label');
    expect(updated.slice(1)).toEqual(original.slice(1));
  });

  it('removeDocument removes exactly the targeted document', () => {
    const original = store.documentsFor('Building Permit');
    const target = original[0];
    store.removeDocument('Building Permit', target.id);
    const after = store.documentsFor('Building Permit');
    expect(after.length).toBe(original.length - 1);
    expect(after.some((d) => d.id === target.id)).toBe(false);
  });

  it('resetToDefault discards every edit and restores the original catalog checklist', () => {
    const original = requirementsFor('Building Permit').documents;
    store.addDocument('Building Permit', {
      label: 'Temp Doc',
      required: false,
      reviewingDepartmentId: 'obo',
    });
    store.removeDocument('Building Permit', original[0].id);
    expect(store.documentsFor('Building Permit')).not.toEqual(original);

    store.resetToDefault('Building Permit');
    expect(store.documentsFor('Building Permit')).toEqual(original);
  });

  it('mutating the array returned by documentsFor() does not affect the store’s own state (defensive copy at seed time)', () => {
    const docs = store.documentsFor('Building Permit');
    const originalLength = docs.length;
    docs.push({ id: 'rogue', label: 'Rogue', required: false, reviewingDepartmentId: 'obo' });
    expect(store.documentsFor('Building Permit').length).toBe(originalLength);
  });
});

describe('RequirementsConfigStore — the stage each document is checked at', () => {
  // The server replaces the whole list on a save and stores a document sent
  // without a stage as Initial. A save that dropped stages would take a permit
  // type out of Zoning / Fire Safety / OBO without anyone choosing to.
  const live: RequirementDocumentDto[] = [
    { code: 'valid-id', label: 'Valid ID', description: '', required: true, stage: 'Initial' },
    { code: 'locational', label: 'Locational Clearance', description: '', required: true, stage: 'Zoning' },
    { code: 'bpnc-fire-safety-clearance', label: 'FSEC', description: '', required: true, stage: 'Fire Safety' },
    { code: 'fence-plan', label: 'Fence plan', description: '', required: true, stage: 'OBO' },
  ];
  let sent: readonly RequirementDocumentDto[] = [];
  let store: RequirementsConfigStore;

  beforeEach(() => {
    sent = [];
    TestBed.configureTestingModule({
      providers: [
        RequirementsConfigStore,
        {
          provide: RequirementsApi,
          useValue: {
            get: async () => ({ kind: 'ok', documents: live }),
            replace: async (_type: string, documents: readonly RequirementDocumentDto[]) => {
              sent = documents;
              return { kind: 'done', documents };
            },
          },
        },
      ],
    });
    store = TestBed.inject(RequirementsConfigStore);
  });

  it('sends every stage back unchanged when an unrelated edit is saved', async () => {
    await store.ensureLoaded('Building Permit', 'New');
    store.updateDocument('Building Permit', 'valid-id', { label: 'Valid government ID' }, 'New');
    await store.saveDocuments('Building Permit', 'New');
    expect(sent.map((d) => [d.code, d.stage])).toEqual([
      ['valid-id', 'Initial'], ['locational', 'Zoning'], ['bpnc-fire-safety-clearance', 'Fire Safety'], ['fence-plan', 'OBO'],
    ]);
  });

  it('shows the department of the stage the server names', async () => {
    await store.ensureLoaded('Fencing Permit');
    expect(store.documentsFor('Fencing Permit').map((d) => d.reviewingDepartmentId)).toEqual(['obo', 'zoning', 'bfp', 'obo']);
  });

  it('gives a document from the static catalog the stage migration 060 would have', () => {
    const fence = requirementsFor('Fencing Permit').documents;
    expect(stageOf(fence.find((d) => d.id.endsWith('-brgy-clearance'))!)).toBe('Initial');
    expect(stageOf(fence.find((d) => d.id.endsWith('-locational'))!)).toBe('Zoning');
  });
});
