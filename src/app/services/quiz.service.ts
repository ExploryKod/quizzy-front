import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, switchMap, take, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Quiz } from '../model/quiz';
import { TranslateService } from '@ngx-translate/core';
import { HateoasService, HateoasUrl } from './hateoas.service';
import { QuizQuestion, QuizQuestionToCreate } from '../model/quiz-question';
import { AuthService } from './auth/auth.service';

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

export interface SubmitAnswerResponse {
  isCorrect: boolean;
}

export interface GetAllQuizApiResponse {
  data: Quiz[];
  _links: {
    create: string;
  };
}

export interface GetAllPublicQuizApiResponse {
  data: Array<Pick<Quiz, 'id' | 'title'> & { description?: string }>;
}

type FakeQuizRecord = Quiz & { _id?: string };
type FakeQuizResponseShape = GetAllQuizApiResponse | FakeQuizRecord | FakeQuizRecord[];

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private readonly httpClient = inject(HttpClient);
  private readonly translateService = inject(TranslateService);
  private readonly hateoasService = inject(HateoasService);
  private readonly authService = inject(AuthService);

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

  getAll(): Observable<QuizListResponse> {
    if (environment.useFakeApi) {
      return this.httpClient.get<FakeQuizResponseShape>(environment.fakeApiUrl).pipe(
        map((response) => this.normalizeFakeResponse(response)),
        tap(response => {
          if (response._links?.create) {
            this.hateoasService.addUrl(HateoasUrl.CreateQuiz, response._links.create);
          }
        }),
        map((response): QuizListResponse => ({
          status: 'OK',
          data: response.data,
          isCreateQuizLinkAvailable: !!response._links?.create
        })),
        catchError((): Observable<QuizListResponse> => {
          return of({ status: 'ERROR', data: [], isCreateQuizLinkAvailable: false });
        })
      );
    }

    return this.authService.getToken().pipe(
      take(1),
      switchMap((token) => {
        if (token) {
          return this.httpClient.get<GetAllQuizApiResponse>(`${environment.apiUrl}/quiz`).pipe(
            tap(response => {
              if (response._links?.create) {
                this.hateoasService.addUrl(HateoasUrl.CreateQuiz, response._links.create);
              }
            }),
            map((response): QuizListResponse => ({
              status: 'OK',
              data: response.data,
              isCreateQuizLinkAvailable: !!response._links?.create,
            })),
            catchError((): Observable<QuizListResponse> =>
              of({ status: 'ERROR', data: [], isCreateQuizLinkAvailable: false })
            )
          );
        }

        return this.httpClient
          .get<GetAllPublicQuizApiResponse>(`${environment.apiUrl}/public/quizzes`)
          .pipe(
            map((response): QuizListResponse => ({
              status: 'OK',
              data: (response.data ?? []).map((quiz) => ({
                id: quiz.id,
                title: quiz.title,
                description: quiz.description ?? '',
                questions: [],
              })),
              isCreateQuizLinkAvailable: false,
            })),
            catchError((): Observable<QuizListResponse> =>
              of({ status: 'ERROR', data: [], isCreateQuizLinkAvailable: false })
            )
          );
      })
    );
  }

  create() {
    const url = this.hateoasService.getUrl(HateoasUrl.CreateQuiz);
    return this.httpClient.post<void>(url || `${environment.apiUrl}/quiz`, {
      title: this.translateService.instant('quiz.defaultTitle'),
      description: this.translateService.instant('quiz.defaultDescription')
    }, {observe: 'response'}).pipe(tap((response) => {
      console.log(JSON.stringify(response.headers));
      if (response.headers.has('Location')) {
        this.hateoasService.addUrl(HateoasUrl.GetQuizAfterPost, response.headers.get('Location') || '');
      }
    }),
      map(response => {
        const location = response.headers.get('Location') || '';
        console.log('Location is', location);
        return location.substring(location.lastIndexOf('/') + 1);
      }));
  }

  get(id: string): Observable<QuizResponse> {
    if (environment.useFakeApi) {
      return this.httpClient.get<FakeQuizResponseShape>(environment.fakeApiUrl).pipe(
        map((response) => this.normalizeFakeResponse(response)),
        map((response): QuizResponse => {
          const quiz = response.data.find((item) => item.id === id);
          if (!quiz) {
            return { status: 'NOT FOUND', data: undefined };
          }
          return { status: 'OK', data: quiz };
        }),
        catchError((): Observable<QuizResponse> => of({ status: 'ERROR', data: undefined }))
      );
    }

    return this.authService.getToken().pipe(
      take(1),
      switchMap((token) => {
        const endpoint = token
          ? `${environment.apiUrl}/quiz/${id}`
          : `${environment.apiUrl}/public/quizzes/${id}`;

        return this.httpClient.get<Quiz>(endpoint).pipe(
          map((response): QuizResponse => ({ status: 'OK' , data: response })),
          catchError((err): Observable<QuizResponse> => {
            if(err.status === 404) {
              return of({ status: 'NOT FOUND', data: undefined });
            }
            return of({ status: 'ERROR', data: undefined });
          } )
        );
      })
    );
  }

  submitAnswer(
    quizId: string,
    questionId: string,
    answerTitle: string
  ): Observable<SubmitAnswerResponse> {
    if (environment.useFakeApi) {
      return this.httpClient.get<FakeQuizResponseShape>(environment.fakeApiUrl).pipe(
        map((response) => this.normalizeFakeResponse(response)),
        map((response) => {
          const quiz = response.data.find((item) => item.id === quizId);
          const question = quiz?.questions.find((item) => item.id === questionId);
          const answer = question?.answers.find((item) => item.title === answerTitle);
          return { isCorrect: !!answer?.isCorrect };
        }),
        catchError((): Observable<SubmitAnswerResponse> => of({ isCorrect: false }))
      );
    }

    return this.httpClient
      .post<{ isCorrect?: boolean }>(
        `${environment.apiUrl}/quiz/${quizId}/questions/${questionId}/answer`,
        { answer: answerTitle }
      )
      .pipe(
        map((response) => ({ isCorrect: !!response?.isCorrect })),
        catchError((): Observable<SubmitAnswerResponse> => of({ isCorrect: false }))
      );
  }

  getQuestions(quizId: string): Observable<QuizQuestion[]> {
    if (environment.useFakeApi) {
      return this.httpClient.get<FakeQuizResponseShape>(environment.fakeApiUrl).pipe(
        map((response) => this.normalizeFakeResponse(response)),
        map((response) => {
          const quiz = response.data.find((item) => item.id === quizId);
          return quiz?.questions ?? [];
        }),
        catchError((): Observable<QuizQuestion[]> => of([]))
      );
    }

    console.warn('QuizService.getQuestions is not implemented on backend yet.');
    return of([]);
  }

  updateTitle(id: string, newTitle: string) {
    return this.httpClient.patch<void>(`${environment.apiUrl}/quiz/${id}`, [{ op: "replace", path: "/title", value: newTitle }]);
  }

  addQuestion(quizId: string): Observable<QuizQuestion> {
    const question: QuizQuestionToCreate = {title: this.translateService.instant('quiz.defaultQuestionTitle'), answers: []};
    return this.httpClient.post<void>(`${environment.apiUrl}/quiz/${quizId}/questions`, question, {observe: 'response'}).pipe(
      map(response => {
        const location = response.headers.get('Location') || '';
        return { id: location.substring(location.lastIndexOf('/') + 1), ...question}
      }));
  }

  updateQuestion(quizId: string, question: QuizQuestion) {
    return this.httpClient.put<void>(`${environment.apiUrl}/quiz/${quizId}/questions/${question.id}`, question);
  }

  start(url: string): Observable<string> {
    return this.httpClient.post<void>(url, {}, {observe: 'response'})
      .pipe(map(response => {
        const location = response.headers.get('Location') || '';
        return location.substring(location.lastIndexOf('/') + 1)
      }));
  }
}
