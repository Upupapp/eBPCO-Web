import { TestBed } from '@angular/core/testing';
import { RequirementsConfigStore } from './requirements-config-store';
import { requirementsFor } from './requirements-catalog';
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
    const before = store.documentsFor('Building Permit – New Construction').length;
    const created = store.addDocument('Building Permit – New Construction', {
      label: 'Notarized Deed of Sale',
      required: true,
      reviewingDepartmentId: 'obo',
    });
    const after = store.documentsFor('Building Permit – New Construction');
    expect(after.length).toBe(before + 1);
    expect(created.id).toBeTruthy();
    expect(after.some((d) => d.id === created.id && d.label === 'Notarized Deed of Sale')).toBe(
      true,
    );
  });

  it('addDocument only affects the permit type it was added to', () => {
    const beforeElectrical = store.documentsFor('Electrical Permit').length;
    store.addDocument('Building Permit – New Construction', {
      label: 'Extra Document',
      required: false,
      reviewingDepartmentId: 'obo',
    });
    expect(store.documentsFor('Electrical Permit').length).toBe(beforeElectrical);
  });

  it('updateDocument patches only the matching document, leaving the rest untouched', () => {
    const original = store.documentsFor('Building Permit – New Construction');
    const target = original[0];
    store.updateDocument('Building Permit – New Construction', target.id, { label: 'Updated Label' });
    const updated = store.documentsFor('Building Permit – New Construction');
    expect(updated[0].label).toBe('Updated Label');
    expect(updated.slice(1)).toEqual(original.slice(1));
  });

  it('removeDocument removes exactly the targeted document', () => {
    const original = store.documentsFor('Building Permit – New Construction');
    const target = original[0];
    store.removeDocument('Building Permit – New Construction', target.id);
    const after = store.documentsFor('Building Permit – New Construction');
    expect(after.length).toBe(original.length - 1);
    expect(after.some((d) => d.id === target.id)).toBe(false);
  });

  it('resetToDefault discards every edit and restores the original catalog checklist', () => {
    const original = requirementsFor('Building Permit – New Construction').documents;
    store.addDocument('Building Permit – New Construction', {
      label: 'Temp Doc',
      required: false,
      reviewingDepartmentId: 'obo',
    });
    store.removeDocument('Building Permit – New Construction', original[0].id);
    expect(store.documentsFor('Building Permit – New Construction')).not.toEqual(original);

    store.resetToDefault('Building Permit – New Construction');
    expect(store.documentsFor('Building Permit – New Construction')).toEqual(original);
  });

  it('mutating the array returned by documentsFor() does not affect the store’s own state (defensive copy at seed time)', () => {
    const docs = store.documentsFor('Building Permit – New Construction');
    const originalLength = docs.length;
    docs.push({ id: 'rogue', label: 'Rogue', required: false, reviewingDepartmentId: 'obo' });
    expect(store.documentsFor('Building Permit – New Construction').length).toBe(originalLength);
  });
});
