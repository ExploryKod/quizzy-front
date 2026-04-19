import { inject, Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { Quiz } from '../../model/quiz';
import { SocketService } from 'src/app/services/socket.service';

export interface StatusEvent {
  status: 'waiting' | 'starting' | 'started' | string;
  participants: number;
}

/** Mirrors API `NextQuestionEventDto` (socket event `newQuestion`). */
export interface NewQuestionEvent {
  question: string;
  questionNumber: number;
  answers: string[];
  totalQuestions: number;
}

export interface HostDetailsEvent {
  /** Mirrors API `HostDetailsEvent.questionCount`. */
  questionCount: number;
  quiz: Quiz;
}

export interface HostJoinEvent {
  executionId: string;
}

@Injectable({ providedIn: 'root' })
export class HostQuizService {
  private readonly socketService = inject(SocketService);

  status$ = this.socketService.listenToEvent<StatusEvent>('status').pipe(tap(
      status => console.log('status', status)
    )
  );
  hostDetails$ = this.socketService.listenToEvent<HostDetailsEvent>('hostDetails')
    .pipe(tap(
      details => console.log('host details', details)
    ));

  /** Host is in the execution room and receives the same `newQuestion` payloads as players. */
  newQuestion$ = this.socketService.listenToEvent<NewQuestionEvent>('newQuestion').pipe(
    tap((ev) => console.log('host newQuestion', ev))
  );

  connect(executionId: string) {
    this.socketService.sendEvent<HostJoinEvent>('host', { executionId });
  }

  nextQuestion(executionId: string) {
    this.socketService.sendEvent('nextQuestion', { executionId });
  }
}
