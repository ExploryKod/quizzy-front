import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonQuizComponent, ButtonQuizInterface } from '../../../../components/buttons/quiz-button/button-quiz.component';
import { Quiz } from '../../../../model/quiz';

@Component({
  selector: 'qzy-quiz-button-list',
  standalone: true,
  imports: [CommonModule, ButtonQuizComponent],
  templateUrl: './quiz-button-list.component.html',
  styleUrl: './quiz-button-list.component.scss',
})
export class QuizButtonListComponent {
  @Input() quizzes: Quiz[] = [];
  @Output() quizClick = new EventEmitter<Quiz>();

  onQuizClick(quiz: Quiz) {
    this.quizClick.emit(quiz);
  }

  toButtonQuiz(quiz: Quiz): ButtonQuizInterface {
    return {
      title: quiz.title,
      icon: quiz.icon || this.buildRawIconFromTitle(quiz.title),
    };
  }

  private buildRawIconFromTitle(title: string): string {
    const firstLetter = (title?.trim().charAt(0) || '?').toUpperCase();
    const hue = this.computeHue(title);
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='10' fill='hsl(${hue},70%,45%)'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='30' fill='white'>${firstLetter}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  private computeHue(seed: string): number {
    let hash = 0;
    for (let index = 0; index < seed.length; index++) {
      hash = (hash * 31 + seed.charCodeAt(index)) | 0;
    }
    return Math.abs(hash) % 360;
  }
}
