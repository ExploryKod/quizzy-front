import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { QuizButtonListComponent } from './components/quiz-button-list/quiz-button-list.component';
import { QuizService } from '../../services/quiz.service';
import { Quiz } from '../../model/quiz';
import { Router } from '@angular/router';

@Component({
  selector: 'qzy-welcome-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, QuizButtonListComponent],
  templateUrl: './welcome-page.component.html',
  styleUrl: './welcome-page.component.scss',
})
export class WelcomePageComponent {
  private readonly quizService = inject(QuizService);
  private readonly router = inject(Router);
  readonly quizzes$ = this.quizService.getWelcomeQuizzes();

  onQuizButtonClick(quiz: Quiz) {
    if (!quiz.id) {
      console.log('Quiz has no id, cannot navigate to questions page');
      return;
    }
    this.router.navigateByUrl(`/quiz-questions/${quiz.id}`);
  }
}
