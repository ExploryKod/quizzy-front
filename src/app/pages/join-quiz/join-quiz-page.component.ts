import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  ClientJoinDetails,
  JoinQuizQuestion,
  QuestionEvent,
  QuizJoinService,
} from './quiz-join.service';
import { filter, take, timer } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { QuizOptionsListComponent } from '../quiz-questions/components/quiz-options-list/quiz-options-list.component';

/** Max wait for `joinDetails` after `join` (invalid code or host not started). */
const JOIN_ACK_MS = 12_000;

@Component({
  selector: 'qzy-join-quiz-page',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RouterLink,
    QuizOptionsListComponent,
  ],
  templateUrl: './join-quiz-page.component.html',
  styleUrl: './join-quiz-page.component.scss',
})
export class JoinQuizPageComponent implements OnInit {
  private readonly quizJoinService = inject(QuizJoinService);
  private readonly destroyRef = inject(DestroyRef);

  status$ = this.quizJoinService.status$;
  quizDetails?: ClientJoinDetails;

  /** Last `newQuestion` payload (aligned with `joinDetails.questions[questionNumber - 1]`). */
  currentQuestionEvent: QuestionEvent | null = null;

  @Input() id!: string;

  /**
   * - checking: waiting for `joinDetails` or timeout
   * - joined: session valid
   * - unavailable: no server ack (bad code, host not started, etc.)
   */
  joinPhase: 'checking' | 'joined' | 'unavailable' = 'checking';

  ngOnInit() {
    const code = this.id?.trim();
    if (!code) {
      this.joinPhase = 'unavailable';
      return;
    }

    this.quizJoinService.joinDetails$
      .pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((details) => {
        this.quizDetails = details;
        this.joinPhase = 'joined';
      });

    timer(JOIN_ACK_MS)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(() => this.joinPhase === 'checking')
      )
      .subscribe(() => {
        this.joinPhase = 'unavailable';
      });

    this.quizJoinService.question$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ev) => {
        this.currentQuestionEvent = ev;
      });

    this.quizJoinService.joinQuiz(code);
  }

  /**
   * Mongo / `joinDetails` question for the current `newQuestion` (same order as host).
   */
  get currentQuestionDef(): JoinQuizQuestion | null {
    const details = this.quizDetails;
    const ev = this.currentQuestionEvent;
    if (!details?.questions?.length || !ev) {
      return null;
    }
    if (ev.answers.length === 0) {
      return null;
    }
    const idx = ev.questionNumber - 1;
    return details.questions[idx] ?? null;
  }

  /** Closing message: no answers left. */
  get isSessionComplete(): boolean {
    const ev = this.currentQuestionEvent;
    return !!ev && ev.answers.length === 0;
  }

  get joinScoreStorageKey(): string {
    return `join-quiz-score:${this.id}`;
  }

  get joinScoreSummary(): { correct: number; total: number } {
    const total = this.quizDetails?.questions?.length ?? 0;
    const raw = localStorage.getItem(this.joinScoreStorageKey);
    let parsed: Record<string, boolean> = {};
    if (raw) {
      try {
        parsed = JSON.parse(raw) as Record<string, boolean>;
      } catch {
        parsed = {};
      }
    }
    const correct =
      this.quizDetails?.questions?.filter((q) => parsed[q.id]).length ?? 0;
    return { correct, total };
  }
}
