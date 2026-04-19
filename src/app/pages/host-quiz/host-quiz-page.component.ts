import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  HostQuizService,
  NewQuestionEvent,
  StatusEvent,
} from './host-quiz.service';
import { Quiz } from '../../model/quiz';
import { environment } from '../../../environments/environment';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'qzy-host-quiz-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, TranslateModule, RouterLink],
  templateUrl: './host-quiz-page.component.html',
  styleUrl: './host-quiz-page.component.scss',
})
export class HostQuizPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly hostQuizService = inject(HostQuizService);
  @Input() id!: string;

  currentStatus?: StatusEvent;
  quiz?: Quiz;
  /** From `hostDetails`; used when `newQuestion.totalQuestions` is missing or unreliable. */
  questionCount = 0;
  /** Last payload from `newQuestion` (same as players). Used to label the primary button. */
  lastNewQuestion?: NewQuestionEvent;

  async ngOnInit() {
    if (!this.id) {
      this.router.navigateByUrl('/');
    }
    this.hostQuizService.status$.subscribe((status) => {
      this.currentStatus = status;
    });
    this.hostQuizService.hostDetails$.subscribe((details) => {
      console.log('host details', details);
      this.quiz = details.quiz as Quiz;
      this.questionCount =
        typeof details.questionCount === 'number' && details.questionCount >= 0
          ? details.questionCount
          : (details.quiz as Quiz)?.questions?.length ?? 0;
    });
    this.hostQuizService.newQuestion$.subscribe((ev) => {
      this.lastNewQuestion = ev;
    });
    this.hostQuizService.connect(this.id);
  }

  protected readonly environment = environment;

  /** After the closing “thank you” message, API sends `answers: []`. */
  isHostQuizCompleted(): boolean {
    return (
      !!this.lastNewQuestion && this.lastNewQuestion.answers.length === 0
    );
  }

  showAdvanceButton(): boolean {
    return !!this.currentStatus && !this.isHostQuizCompleted();
  }

  /** i18n key for the primary control (start → next → end). */
  advanceButtonKey(): string {
    const ev = this.lastNewQuestion;
    if (!ev) {
      return 'hostQuizPage.button.startQuiz';
    }
    if (ev.answers.length === 0) {
      return 'hostQuizPage.button.endQuiz';
    }
    const totalFromEvent = Number(ev.totalQuestions);
    const total =
      Number.isFinite(totalFromEvent) && totalFromEvent > 0
        ? totalFromEvent
        : this.questionCount;
    const num = Number(ev.questionNumber);
    const qn = Number.isFinite(num) ? num : 0;
    if (total > 0 && qn < total) {
      return 'hostQuizPage.button.nextQuestion';
    }
    return 'hostQuizPage.button.endQuiz';
  }

  nextQuestion() {
    this.hostQuizService.nextQuestion(this.id);
  }
}
