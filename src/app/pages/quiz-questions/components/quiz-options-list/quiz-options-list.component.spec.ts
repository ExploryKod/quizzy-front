import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { QuizService } from '../../../../services/quiz.service';
import {
  QuizAnswerOption,
  QuizOptionsListComponent,
} from './quiz-options-list.component';

describe('QuizOptionsListComponent', () => {
  let fixture: ComponentFixture<QuizOptionsListComponent>;
  let component: QuizOptionsListComponent;

  const quizServiceMock = {
    submitAnswer: jest.fn(),
  };
  const translateServiceMock = {
    get: jest.fn((key: string | string[]) => of(key)),
    stream: jest.fn((key: string | string[]) => of(key)),
    instant: jest.fn((key: string) => key),
    onLangChange: of(),
    onTranslationChange: of(),
    onDefaultLangChange: of(),
  };

  const answers: QuizAnswerOption[] = [
    { title: 'A', isCorrect: true },
    { title: 'B', isCorrect: false },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizOptionsListComponent],
      providers: [
        { provide: QuizService, useValue: quizServiceMock },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizOptionsListComponent);
    component = fixture.componentInstance;
    component.quizId = 'quiz-1';
    component.questionId = 'question-1';
    component.answers = answers;
    localStorage.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should submit selected answer and store score when correct', () => {
    quizServiceMock.submitAnswer.mockReturnValue(of({ isCorrect: true }));
    const nextSpy = jest.spyOn(component.nextQuestion, 'emit');

    component.onAnswerClick(answers[0]);
    component.onSubmitOrNext();

    expect(quizServiceMock.submitAnswer).toHaveBeenCalledWith(
      'quiz-1',
      'question-1',
      'A'
    );
    expect(component.isSubmitted).toBe(true);
    expect(component.isAnswerCorrect).toBe(true);
    expect(nextSpy).not.toHaveBeenCalled();
    expect(localStorage.getItem('quiz-score:quiz-1')).toBe(
      JSON.stringify({ 'question-1': true })
    );
  });

  it('should not store score when submitted answer is incorrect', () => {
    quizServiceMock.submitAnswer.mockReturnValue(of({ isCorrect: false }));

    component.onAnswerClick(answers[1]);
    component.onSubmitOrNext();

    expect(component.isSubmitted).toBe(true);
    expect(component.isAnswerCorrect).toBe(false);
    expect(localStorage.getItem('quiz-score:quiz-1')).toBeNull();
  });

  it('should emit nextQuestion after result when submit is clicked again', () => {
    quizServiceMock.submitAnswer.mockReturnValue(of({ isCorrect: true }));
    const nextSpy = jest.spyOn(component.nextQuestion, 'emit');

    component.onAnswerClick(answers[0]);
    component.onSubmitOrNext();
    component.onSubmitOrNext();

    expect(nextSpy).toHaveBeenCalledTimes(1);
  });
});
