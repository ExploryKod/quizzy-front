import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface HeaderQuizMeta {
  title: string;
  icon: string;
}

@Injectable({
  providedIn: 'root',
})
export class HeaderUiService {
  private readonly quizMetaSubject = new BehaviorSubject<HeaderQuizMeta | null>(
    null
  );

  readonly quizMeta$ = this.quizMetaSubject.asObservable();

  setQuizMeta(meta: HeaderQuizMeta): void {
    this.quizMetaSubject.next(meta);
  }

  clearQuizMeta(): void {
    this.quizMetaSubject.next(null);
  }
}
