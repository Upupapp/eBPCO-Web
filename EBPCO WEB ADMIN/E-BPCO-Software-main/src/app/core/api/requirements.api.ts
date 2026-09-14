import { Injectable, inject } from '@angular/core';

import { ApiClient } from './api.client';
import { ApiError } from './problem';

/**
 * A permit type's required-document checklist — `requirements.controller.ts`
 * (no class-level path prefix, so each route below is exactly as written).
 *
 * `PUT` replaces the *whole list* per permit type; there is no per-document
 * add/update/delete route, so a batched save is the only way to persist an
 * edit. `.strict()` server-side: sending anything beyond
 * `{code, label, description, required}` per document — a
 * `reviewingDepartmentId`, an `id` — 400s the entire request. There is no
 * "reviewing department" concept anywhere server-side; keep that field
 * client-only, sourced from the static requirements catalog, never sent here.
 */

export interface RequirementDocumentDto {
  readonly code: string;
  readonly label: string;
  readonly description?: string;
  readonly required: boolean;
}

export type RequirementsReadResult =
  | { readonly kind: 'ok'; readonly documents: readonly RequirementDocumentDto[] }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

export type RequirementsWriteResult =
  | { readonly kind: 'done'; readonly documents: readonly RequirementDocumentDto[] }
  | { readonly kind: 'refused'; readonly message: string }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

@Injectable({ providedIn: 'root' })
export class RequirementsApi {
  private readonly api = inject(ApiClient);

  /** `GET staff/config/requirements/:permitType` — scope `applications:read`. */
  async get(permitType: string): Promise<RequirementsReadResult> {
    try {
      const result = await this.api.get<{ documents: readonly RequirementDocumentDto[] }>(
        `/staff/config/requirements/${encodeURIComponent(permitType)}`,
      );
      return { kind: 'ok', documents: result.documents ?? [] };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404 || error.status === 501) return { kind: 'unavailable' };
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }

  /** `PUT staff/config/requirements/:permitType` — scope `staff:administer` (Administrator/Super Admin only). Refused: unknown-permit-type (404), duplicate-code (422). */
  async replace(
    permitType: string,
    documents: readonly RequirementDocumentDto[],
  ): Promise<RequirementsWriteResult> {
    try {
      const result = await this.api.put<{ documents: readonly RequirementDocumentDto[] }>(
        `/staff/config/requirements/${encodeURIComponent(permitType)}`,
        { documents },
      );
      return { kind: 'done', documents: result.documents ?? documents };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 501) return { kind: 'unavailable' };
        if (error.status === 404 || error.status === 422) {
          return { kind: 'refused', message: error.message };
        }
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }
}
