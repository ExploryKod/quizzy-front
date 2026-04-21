import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quiz } from '../../../../../model/quiz';
import { Router } from '@angular/router';
import { ButtonQuizAction, ButtonQuizComponent, ButtonQuizInterface } from '../../../../../components/buttons/quiz-button/button-quiz.component';

@Component({
  selector: 'qzy-quiz-list-table',
  standalone: true,
  imports: [CommonModule, ButtonQuizComponent],
  templateUrl: './quiz-list-table.component.html',
  styleUrl: './quiz-list-table.component.scss',
})
export class QuizListTableComponent {
  private readonly router = inject(Router);
  @Input() quizzes!: Quiz[];
  @Output() startQuiz = new EventEmitter<string>();

  onStartQuiz(url: string) {
    this.startQuiz.emit(url);
  }

  onActionClick(actionKey: string, quiz: Quiz) {
    if (actionKey === 'edit') {
      this.router.navigateByUrl(`/quiz/${quiz.id}`);
      return;
    }
    if (actionKey === 'start' && quiz._links?.start) {
      this.onStartQuiz(quiz._links.start);
    }
  }

  toButtonQuiz(quiz: Quiz): ButtonQuizInterface {
    return {
      title: quiz.title,
      icon: quiz.icon || this.buildRawIconFromTitle(quiz.title),
    };
  }

  getActions(quiz: Quiz): ButtonQuizAction[] {
    return [
      { key: 'edit', icon: 'edit', ariaLabel: 'Edit quiz' },
      { key: 'start', icon: 'play_circle', ariaLabel: 'Start quiz', isVisible: !!quiz._links?.start },
    ];
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
