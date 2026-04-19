import { HttpErrorResponse } from '@angular/common/http';

/**
 * Turns HttpClient failures into short lines for UI + debugging (Nest, plain text, network).
 */
export function messagesFromAuthHttpError(error: unknown): string[] {
  if (error instanceof HttpErrorResponse) {
    const lines: string[] = [];
    const { status, statusText, error: body } = error;
    if (status) {
      lines.push(`HTTP ${status}${statusText ? ` ${statusText}` : ''}`);
    }
    if (body === null || body === undefined || body === '') {
      if (status === 0) {
        lines.push(
          'Network error — check API URL, CORS, and that the server is running.'
        );
      }
      return lines.length ? lines : ['Request failed'];
    }
    if (typeof body === 'string') {
      lines.push(body);
      return dedupeLines(lines);
    }
    if (typeof body === 'object') {
      const o = body as Record<string, unknown>;
      const msg = o['message'];
      if (Array.isArray(msg)) {
        lines.push(...msg.map(String));
      } else if (typeof msg === 'string') {
        lines.push(msg);
      }
      const fieldErrors = o['errors'];
      if (fieldErrors && typeof fieldErrors === 'object' && !Array.isArray(fieldErrors)) {
        for (const v of Object.values(fieldErrors as Record<string, unknown>)) {
          if (Array.isArray(v)) {
            lines.push(...v.map(String));
          } else if (v != null) {
            lines.push(String(v));
          }
        }
      }
      const errLabel = o['error'];
      if (typeof errLabel === 'string' && errLabel) {
        if (!lines.some((l) => l.includes(errLabel))) {
          lines.push(errLabel);
        }
      }
    }
    const filtered = dedupeLines(lines.filter(Boolean));
    return filtered.length ? filtered : [`Request failed${status ? ` (${status})` : ''}`];
  }
  if (error instanceof Error) {
    return [error.message];
  }
  return ['Request failed'];
}

function dedupeLines(lines: string[]): string[] {
  return [...new Set(lines)];
}
