import { Injectable } from '@angular/core';

export enum HateoasUrl {
  CreateQuiz = 'createQuiz',
  GetQuizAfterPost = 'getQuiz',
}

@Injectable({
  providedIn: 'root'
})
export class HateoasService {
  private urls = new Map<string, string>;

  private normalizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      // Convert absolute backend links to same-origin relative paths
      // so browser calls keep HTTPS on the frontend domain.
      if (parsed.pathname.startsWith('/api/')) {
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
      return url;
    } catch {
      return url;
    }
  }

  addUrl(key: HateoasUrl, url: string) {
    this.urls.set(key, this.normalizeUrl(url));
  }

  getUrl(key: HateoasUrl): string {
    return this.urls.get(key) ?? '';
  }

  hasUrl(key: HateoasUrl): boolean {
    return this.urls.has(key);
  }
}
