import { Route } from '@angular/router';
import { WelcomePageComponent } from './pages/welcome/welcome-page.component';
import { QuizQuestionsComponent } from './pages/quiz-questions/quiz-questions.component';


export const appRoutes: Route[] = [
  {
    path: '',
    component: WelcomePageComponent
  },
  {
    path: 'quiz-questions/:id',
    component: QuizQuestionsComponent
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: ''
  }
];
