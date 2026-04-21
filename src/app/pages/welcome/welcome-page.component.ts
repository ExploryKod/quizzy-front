import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth/auth.service';
import { QuizButtonListComponent } from './components/quiz-button-list/quiz-button-list.component';
import { QuizService } from '../../services/quiz.service';
import { filter, switchMap, take } from 'rxjs';
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
  private readonly authService = inject(AuthService);
  private readonly quizService = inject(QuizService);
  private readonly router = inject(Router);
  isLogged$ = this.authService.isLogged$;
  quizzes$ = this.authService.isLogged$.pipe(
    filter(isLogged => isLogged === true),
    switchMap(() => this.authService.getToken()),
    filter(token => token !== null && token !== undefined && token !== ''),
    take(1),
    switchMap(() => this.quizService.getAll())
  );

  onQuizButtonClick(quiz: Quiz) {
    const startUrl = quiz._links?.start;
    if (!startUrl) {
      console.log('Quiz has no start link yet', quiz.id);
      return;
    }

    this.quizService.start(startUrl).subscribe({
      next: (executionId) => {
        this.router.navigateByUrl(`/join/${executionId}`);
      },
      error: (error) => {
        console.error('Failed to start quiz', quiz.id, error);
      },
    });
  }
}
