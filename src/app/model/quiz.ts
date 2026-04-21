import { QuizQuestion } from './quiz-question';

export interface Quiz {
  id: string;
  title: string;
  icon?: string;

  questions: QuizQuestion[];

  _links?: {
    start?: string;
  }
}
