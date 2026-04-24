import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { QuizService } from '../../services/quiz.service';
import { Quiz } from '../../model/quiz';
import { QuizQuestion } from '../../model/quiz-question';
import {
  QuizAnswerOption,
  QuizOptionsListComponent,
} from './components/quiz-options-list/quiz-options-list.component';
import { QuizScoreCardComponent } from './components/quiz-score-card/quiz-score-card.component';
import { HeaderUiService } from '../../services/header-ui.service';

@Component({
  selector: 'qzy-quiz-questions-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, QuizOptionsListComponent, QuizScoreCardComponent],
  templateUrl: './quiz-questions.components.html',
  styleUrl: './quiz-questions.component.scss',
})
export class QuizQuestionsComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly quizService = inject(QuizService);
  private readonly headerUiService = inject(HeaderUiService);

  quiz: Quiz | null = null;
  currentQuestionIndex = 0;
  showScoreCard = false;
  finalScore = { correct: 0, total: 0 };
  loadErrorKey: 'quizQuestions.notReadyYet' | 'quizQuestions.noAnswers' | null =
    null;

  ngOnInit(): void {
    const routeQuizId = this.route.snapshot.paramMap.get('id');
    if (routeQuizId) {
      this.loadQuizById(routeQuizId);
      return;
    }
    this.quizService.getAll().subscribe((response) => {
      if (response.status !== 'OK' || response.data.length === 0) {
        this.loadErrorKey = 'quizQuestions.noAnswers';
        return;
      }
      this.quiz = response.data[0];
      this.headerUiService.setQuizMeta({
        title: this.quiz.title,
        icon: this.quiz.icon || 'assets/icons/icon-html.svg',
      });
      this.currentQuestionIndex = 0;
      this.showScoreCard = false;
      this.loadErrorKey = null;
    });
  }

  get currentQuestion(): QuizQuestion | null {
    if (!this.quiz || !this.quiz.questions?.length) {
      return null;
    }
    return this.quiz.questions[this.currentQuestionIndex] ?? null;
  }

  get currentAnswers(): QuizAnswerOption[] {
    return this.currentQuestion?.answers ?? [];
  }

  get isLastQuestion(): boolean {
    if (!this.quiz?.questions?.length) {
      return false;
    }
    return this.currentQuestionIndex === this.quiz.questions.length - 1;
  }

  onAnswerClick(_answer: QuizAnswerOption) {
    // Selection and submit logic is handled in qzy-quiz-options-list.
  }

  onNextQuestion() {
    if (!this.quiz) {
      return;
    }
    const nextIndex = this.currentQuestionIndex + 1;
    if (nextIndex < this.quiz.questions.length) {
      this.currentQuestionIndex = nextIndex;
    }
  }

  onGetScore() {
    if (!this.quiz) {
      return;
    }
    const storageKey = `quiz-score:${this.quiz.id}`;
    const raw = localStorage.getItem(storageKey);
    const parsed: Record<string, boolean> = raw ? JSON.parse(raw) : {};
    const correct = this.quiz.questions.filter((question) => parsed[question.id]).length;
    this.finalScore = {
      correct,
      total: this.quiz.questions.length,
    };
    this.showScoreCard = true;
  }

  onPlayAgain() {
    this.router.navigateByUrl('/');
  }

  private loadQuizById(quizId: string) {
    this.quizService.get(quizId).subscribe((response) => {
      if (response.status !== 'OK' || !response.data) {
        this.loadErrorKey = 'quizQuestions.noAnswers';
        return;
      }

      if (!this.isReadyForPublicPlay(response.data)) {
        this.loadErrorKey = 'quizQuestions.notReadyYet';
        return;
      }

      this.quiz = response.data;
      this.headerUiService.setQuizMeta({
        title: this.quiz.title,
        icon: this.quiz.icon || 'assets/icons/icon-html.svg',
      });
      this.currentQuestionIndex = 0;
      this.showScoreCard = false;
      this.loadErrorKey = null;
    });
  }

  private isReadyForPublicPlay(quiz: Quiz): boolean {
    if (!Array.isArray(quiz.questions) || quiz.questions.length < 2) {
      return false;
    }
    return quiz.questions.every(
      (question) => Array.isArray(question.answers) && question.answers.length >= 2
    );
  }

  ngOnDestroy(): void {
    this.headerUiService.clearQuizMeta();
  }
}
