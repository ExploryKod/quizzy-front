import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ButtonOptionComponent,
  ButtonOptionInterface,
} from '../../../../components/buttons/button-option/button-option.component';
import { QuizService } from '../../../../services/quiz.service';
import { TranslateModule } from '@ngx-translate/core';

export interface QuizAnswerOption {
  title: string;
  isCorrect: boolean;
}

@Component({
  selector: 'qzy-quiz-options-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonOptionComponent],
  templateUrl: './quiz-options-list.component.html',
  styleUrl: './quiz-options-list.component.scss',
})
export class QuizOptionsListComponent implements OnChanges {
  private readonly quizService = inject(QuizService);

  @Input({ required: true }) quizId = '';
  @Input({ required: true }) questionId = '';
  @Input() answers: QuizAnswerOption[] = [];
  @Input() isLastQuestion = false;
  @Input() nextQuestionLabel = 'quizQuestions.nextQuestion';
  @Input() getScoreLabel = 'quizQuestions.getScore';
  @Input() submitAnswerLabel = 'quizQuestions.submit';
  @Output() answerClick = new EventEmitter<QuizAnswerOption>();
  @Output() nextQuestion = new EventEmitter<void>();
  @Output() getScore = new EventEmitter<void>();

  selectedAnswerTitle: string | null = null;
  submittedAnswerTitle: string | null = null;
  isSubmitted = false;
  isAnswerCorrect = false;
  isSubmitting = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['questionId'] && !changes['questionId'].firstChange) {
      this.resetQuestionState();
    }
  }

  onAnswerClick(answer: QuizAnswerOption) {
    if (this.isSubmitted) {
      return;
    }
    this.selectedAnswerTitle = answer.title;
    this.answerClick.emit(answer);
  }

  onSubmitOrNext() {
    if (this.isSubmitted) {
      if (this.isLastQuestion) {
        this.getScore.emit();
        return;
      }
      this.nextQuestion.emit();
      return;
    }
    if (!this.selectedAnswerTitle || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.quizService
      .submitAnswer(this.quizId, this.questionId, this.selectedAnswerTitle)
      .subscribe({
        next: (response) => {
          this.isSubmitted = true;
          this.submittedAnswerTitle = this.selectedAnswerTitle;
          this.isAnswerCorrect = response.isCorrect;
          this.persistScoreIfCorrect();
          this.isSubmitting = false;
        },
        error: () => {
          this.isSubmitting = false;
        },
      });
  }

  toButtonOption(answer: QuizAnswerOption, index: number): ButtonOptionInterface {
    return {
      title: answer.title,
      icon: this.buildIndexIcon(index),
    };
  }

  private buildIndexIcon(index: number): string {
    const label = String.fromCharCode(65 + (index % 26));
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='12' fill='#F0F1F5'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='34' font-weight='700' fill='#626C7F'>${label}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  isSelected(answer: QuizAnswerOption): boolean {
    return this.selectedAnswerTitle === answer.title;
  }

  isCorrect(answer: QuizAnswerOption): boolean {
    return this.isSubmitted && this.isSelected(answer) && this.isAnswerCorrect;
  }

  isIncorrect(answer: QuizAnswerOption): boolean {
    return this.isSubmitted && this.isSelected(answer) && !this.isAnswerCorrect;
  }

  private persistScoreIfCorrect() {
    if (!this.isAnswerCorrect) {
      return;
    }
    const storageKey = `quiz-score:${this.quizId}`;
    const raw = localStorage.getItem(storageKey);
    const parsed: Record<string, boolean> = raw ? JSON.parse(raw) : {};
    parsed[this.questionId] = true;
    localStorage.setItem(storageKey, JSON.stringify(parsed));
  }

  private resetQuestionState() {
    this.selectedAnswerTitle = null;
    this.submittedAnswerTitle = null;
    this.isSubmitted = false;
    this.isAnswerCorrect = false;
    this.isSubmitting = false;
  }
}
