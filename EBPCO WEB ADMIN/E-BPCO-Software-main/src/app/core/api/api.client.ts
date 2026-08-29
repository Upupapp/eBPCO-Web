import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from './api.config';
import { ApiError, toProblem } from './problem';

/**
 * One place that talks to the API.
 *
 * Promises rather than Observables at this boundary: every consumer here is a
 * signal-based component that awaits a value once, and handing them a stream
 * they must remember to unsubscribe from would be offering a hazard in exchange
 * for nothing.
 *
 * Every failure becomes an `ApiError` carrying the server's Problem Details, so
 * a caller catches one shape instead of inspecting `HttpErrorResponse` and
 * guessing whether `error.error` is a document or a string.
 */
@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  async get<T>(path: string, query: Record<string, string | number | undefined> = {}): Promise<T> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) params = params.set(key, String(value));
    }
    return this.send(() => firstValueFrom(
      this.http.get<T>(`${this.baseUrl}${path}`, { params }),
    ));
  }

  async post<T>(path: string, body: unknown = {}, idempotencyKey?: string): Promise<T> {
    return this.send(() => firstValueFrom(
      this.http.post<T>(`${this.baseUrl}${path}`, body, {
        headers: idempotencyKey === undefined ? {} : { 'idempotency-key': idempotencyKey },
      }),
    ));
  }

  private async send<T>(call: () => Promise<T>): Promise<T> {
    try {
      return await call();
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        // `error.error` is the parsed body when the server sent JSON, and a
        // string or ProgressEvent when it did not. `toProblem` decides which,
        // rather than each caller re-deciding.
        throw new ApiError(toProblem(error.status, error.error));
      }
      throw error;
    }
  }
}
