import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateService } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  const translateServiceMock = {
    setDefaultLang: jest.fn(),
    setTranslation: jest.fn(),
    use: jest.fn(),
    get: jest.fn((key: string | string[]) => of(key)),
    stream: jest.fn((key: string | string[]) => of(key)),
    instant: jest.fn((key: string) => key),
    onLangChange: of(),
    onTranslationChange: of(),
    onDefaultLangChange: of(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule],
      providers: [
        { provide: TranslateService, useValue: translateServiceMock },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  it(`should have as title 'quizzy-front'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('quizzy-front');
  });

  it('should render app shell main element', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('main')).not.toBeNull();
  });

  it('should apply a page-* class to body', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const hasPageClass = Array.from(document.body.classList).some((className) =>
      className.startsWith('page-')
    );
    expect(hasPageClass).toBe(true);
  });
});
