import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { QuizService } from '../../../../services/quiz.service';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { QuizListComponent } from './quiz-list/quiz-list.component';
import { AuthService } from '../../../../services/auth/auth.service';
import { filter, switchMap, take } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'qzy-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatButtonModule, RouterLink, QuizListComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly quizService = inject(QuizService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  
  quizzes$ = environment.useFakeApi
    ? this.quizService.getAll()
    : this.authService.isLogged$.pipe(
      filter(isLogged => isLogged === true),
      switchMap(() => this.authService.getToken()),
      filter(token => token !== null && token !== undefined && token !== ''),
      take(1),
      switchMap(() => this.quizService.getAll())
    );

  createQuiz() {
    this.quizService.create().subscribe((quizId) => {
      this.router.navigateByUrl(`/quiz/${quizId}`);
    });
  }

  startQuiz(url: string) {
    this.quizService.start(url).subscribe((executionId) => {
      console.log(`executionId: ${executionId}`);
      this.router.navigateByUrl(`/host/${executionId}`);
    });
  }
}
