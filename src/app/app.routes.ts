import { Route } from '@angular/router';
import { WelcomePageComponent } from './pages/welcome/welcome-page.component';
import { MyQuizzesComponent } from './pages/my-quizzes/my-quizzes.component';
import { QuizQuestionsComponent } from './pages/quiz-questions/quiz-questions.component';


export const appRoutes: Route[] = [
  {
    path: '',
    component: WelcomePageComponent
  },
  {
    path: 'quiz',
    loadChildren: () => import('./pages/quiz-edit/quiz-edit.routes').then(m => m.quizEditRoutes)
  },
  {
    path: 'host',
    loadChildren: () => import('./pages/host-quiz/host-quiz.routes').then(m => m.hostQuizRoutes)
  },
  {
    path: 'join',
    loadChildren: () => import('./pages/join-quiz/join-quiz.routes').then(m => m.joinQuizRoutes)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.routes').then(m => m.loginRoutes)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.routes').then(m => m.registerRoutes)
  },
  {
    path: 'my-quizzes',
    component: MyQuizzesComponent
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
