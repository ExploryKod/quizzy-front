import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { QuizService } from '../../services/quiz.service';
import { QuizQuestionsComponent } from './quiz-questions.component';

describe('QuizQuestionsComponent', () => {
  let fixture: ComponentFixture<QuizQuestionsComponent>;
  let component: QuizQuestionsComponent;

  const quizServiceMock = {
    getAll: jest.fn(),
    get: jest.fn(),
  };
  const translateServiceMock = {
    get: jest.fn((key: string | string[]) => of(key)),
    stream: jest.fn((key: string | string[]) => of(key)),
    instant: jest.fn((key: string) => key),
    onLangChange: of(),
    onTranslationChange: of(),
    onDefaultLangChange: of(),
  };

  const routeMock = {
    snapshot: {
      paramMap: {
        get: jest.fn().mockReturnValue(null),
      },
    },
  };

  const quizMock = {
    id: 'quiz-1',
    title: 'Quiz',
    questions: [
      { id: 'q1', title: 'Question 1', answers: [{ title: 'A', isCorrect: true }] },
      { id: 'q2', title: 'Question 2', answers: [{ title: 'B', isCorrect: false }] },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizQuestionsComponent],
      providers: [
        { provide: QuizService, useValue: quizServiceMock },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizQuestionsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should load first quiz from getAll when route id is missing', () => {
    quizServiceMock.getAll.mockReturnValue(
      of({ status: 'OK', data: [quizMock], isCreateQuizLinkAvailable: true })
    );

    component.ngOnInit();

    expect(quizServiceMock.getAll).toHaveBeenCalled();
    expect(component.quiz?.id).toBe('quiz-1');
    expect(component.currentQuestion?.id).toBe('q1');
  });

  it('should increment question index on next and stop at last question', () => {
    component.quiz = quizMock;

    component.onNextQuestion();
    expect(component.currentQuestionIndex).toBe(1);
    expect(component.currentQuestion?.id).toBe('q2');

    component.onNextQuestion();
    expect(component.currentQuestionIndex).toBe(1);
  });
});
