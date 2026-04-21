import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { JoinComponent } from './components/join/join.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ChatComponent } from './components/chat/chat.component';
import { AuthService } from '../../services/auth/auth.service';
import { QuizService } from '../../services/quiz.service';
import { filter, switchMap, take } from 'rxjs';
import { NotLoggedComponent } from './components/not-logged/not-logged.component';

@Component({
  selector: 'qzy-my-quizzes',
  standalone: true,
  imports: [CommonModule, TranslateModule, JoinComponent, DashboardComponent, ChatComponent, NotLoggedComponent],
  templateUrl: './my-quizzes.component.html',
  styleUrl: './my-quizzes.component.scss',
})
export class MyQuizzesComponent {
  private readonly authService = inject(AuthService);
  private readonly quizService = inject(QuizService);
  isLogged$ = this.authService.isLogged$;
  quizzes$ = this.authService.isLogged$.pipe(
    filter(isLogged => isLogged === true),
    switchMap(() => this.authService.getToken()),
    filter(token => token !== null && token !== undefined && token !== ''),
    take(1),
    switchMap(() => this.quizService.getAll())
  );
}
