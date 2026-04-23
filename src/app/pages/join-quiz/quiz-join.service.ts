import { inject, Injectable } from '@angular/core';
import { SocketIoService } from '../../services/socket-io.service';
import { SocketService } from '../../services/socket.service';

export interface StatusEvent {
  status: 'waiting' | 'starting' | 'started' | string;
  participants: number;
}

/** Mirrors server `joinDetails` + Mongo quiz shape: answers include `isCorrect` for local scoring. */
export interface JoinQuizQuestion {
  id: string;
  title: string;
  answers: { title: string; isCorrect: boolean }[];
}

export interface ClientJoinDetails {
  quizTitle: string;
  description?: string;
  questions?: JoinQuizQuestion[];
}

export interface ClientJoinEvent {
  executionId: string;
}

/** Same shape as `NextQuestionEventDto` / `host` `newQuestion`. */
export interface QuestionEvent {
  question: string;
  questionNumber: number;
  answers: string[];
  totalQuestions: number;
}

@Injectable({ providedIn: 'root' })
export class QuizJoinService {
  private readonly socketService = inject(SocketService);
  status$ = this.socketService.listenToEvent<StatusEvent>('status');
  question$ = this.socketService.listenToEvent<QuestionEvent>('newQuestion');
  joinDetails$ = this.socketService.listenToEvent<ClientJoinDetails>(
    'joinDetails'
  );

  joinQuiz(id: string){
      this.socketService.sendEvent<ClientJoinEvent>('join', { executionId: id });
  }
}
