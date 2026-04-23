import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'qzy-quiz-score-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './quiz-score-card.component.html',
  styleUrl: './quiz-score-card.component.scss',
})
export class QuizScoreCardComponent {
  @Input() quizTitle = '';
  @Input() quizIcon = 'assets/icons/icon-html.svg';
  @Input() correctAnswers = 0;
  @Input() totalQuestions = 0;
}
