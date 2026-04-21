import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { QuizService } from '../../services/quiz.service';
import { Quiz } from '../../model/quiz';
import { QuizQuestion } from '../../model/quiz-question';
import {
  QuizAnswerOption,
  QuizOptionsListComponent,
} from './components/quiz-options-list/quiz-options-list.component';

@Component({
  selector: 'qzy-quiz-questions-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, QuizOptionsListComponent],
  templateUrl: './quiz-questions.components.html',
  styleUrl: './quiz-questions.component.scss',
})
export class QuizQuestionsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly quizService = inject(QuizService);

  quiz: Quiz | null = null;
  currentQuestionIndex = 0;

  ngOnInit(): void {
    const routeQuizId = this.route.snapshot.paramMap.get('id');
    if (routeQuizId) {
      this.loadQuizById(routeQuizId);
      return;
    }
    this.quizService.getAll().subscribe((response) => {
      if (response.status !== 'OK' || response.data.length === 0) {
        return;
      }
      this.quiz = response.data[0];
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

  private loadQuizById(quizId: string) {
    this.quizService.get(quizId).subscribe((response) => {
      if (response.status !== 'OK' || !response.data) {
        return;
      }
      this.quiz = response.data;
    });
  }
}
