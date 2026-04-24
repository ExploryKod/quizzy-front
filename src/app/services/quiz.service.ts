import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Quiz } from '../model/quiz';

export interface QuizListResponse {
  status: 'OK' | 'ERROR';
  data: Quiz[];
  isCreateQuizLinkAvailable: boolean;
  _links? : {
    create?: string;
  }
}

export interface QuizResponse {
  status: 'OK' | 'NOT FOUND' | 'ERROR';
  data?: Quiz;
}

export interface GetAllQuizApiResponse {
  data: Quiz[];
  _links: {
    create: string;
  };
}

type FakeQuizRecord = Quiz & { _id?: string };
type FakeQuizResponseShape = GetAllQuizApiResponse | FakeQuizRecord | FakeQuizRecord[];

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private readonly httpClient = inject(HttpClient);

  private loadQuizzes(): Observable<Quiz[]> {
    return this.httpClient.get<FakeQuizResponseShape>(environment.fakeApiUrl).pipe(
      map((response) => this.normalizeFakeResponse(response).data),
      catchError((): Observable<Quiz[]> => of([]))
    );
  }

  private normalizeFakeResponse(response: FakeQuizResponseShape): GetAllQuizApiResponse {
    if (Array.isArray(response)) {
      return { data: response.map((quiz) => this.normalizeQuiz(quiz)), _links: { create: '' } };
    }

    if ('data' in response && Array.isArray(response.data)) {
      return {
        data: response.data.map((quiz) => this.normalizeQuiz(quiz)),
        _links: response._links ?? { create: '' },
      };
    }

    return { data: [this.normalizeQuiz(response as FakeQuizRecord)], _links: { create: '' } };
  }

  private normalizeQuiz(quiz: FakeQuizRecord): Quiz {
    const fallbackId = quiz._id;
    return {
      ...quiz,
      id: quiz.id ?? fallbackId ?? '',
      questions: (quiz.questions ?? []).map((question) => ({
        ...question,
        id: question.id ?? (question as { _id?: string })._id ?? '',
        answers: question.answers ?? [],
      })),
    };
  }

  getPublicQuizzes(): Observable<Quiz[]> {
    return this.loadQuizzes().pipe(
      map((quizzes) => quizzes.map((quiz) => ({ ...quiz, isPrivate: false })))
    );
  }

  getWelcomeQuizzes(): Observable<Quiz[]> {
    return this.getPublicQuizzes();
  }

  getAll(): Observable<QuizListResponse> {
    return this.loadQuizzes().pipe(
      map((quizzes): QuizListResponse => ({
        status: 'OK',
        data: quizzes,
        isCreateQuizLinkAvailable: false,
      })),
      catchError((): Observable<QuizListResponse> =>
        of({ status: 'ERROR', data: [], isCreateQuizLinkAvailable: false })
      )
    );
  }

  get(id: string): Observable<QuizResponse> {
    return this.loadQuizzes().pipe(
      map((quizzes) => {
        const quiz = quizzes.find((item) => item.id === id);
        if (!quiz) {
          return { status: 'NOT FOUND', data: undefined } as QuizResponse;
        }
        return { status: 'OK', data: quiz } as QuizResponse;
      }),
      catchError((): Observable<QuizResponse> => of({ status: 'ERROR', data: undefined }))
    );
  }
}
