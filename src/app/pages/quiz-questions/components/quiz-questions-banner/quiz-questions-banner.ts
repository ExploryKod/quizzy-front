import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'qzy-quiz-questions-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-questions-banner.html',
  styleUrl: './quiz-questions-banner.scss',
})
export class QuizQuestionsBannerComponent {
  @Input() quizTitle = '';
  @Input() quizIcon = 'assets/icons/icon-html.svg';
  @Input() isDarkMode = false;
  @Output() themeModeChange = new EventEmitter<boolean>();

  onToggle(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.themeModeChange.emit(isChecked);
  }
}
