import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { en } from './translations/en';
import { AppHeaderComponent } from './components/layouts/app-header/app-header.component';
import { HeaderUiService } from './services/header-ui.service';

@Component({
  standalone: true,
  imports: [RouterModule, AppHeaderComponent],
  selector: 'qzy-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly translateService = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly headerUiService = inject(HeaderUiService);
  title = 'quizzy-front';
  isDarkMode = false;
  showQuizMeta = false;
  bannerTitle = '';
  bannerIcon = '';

  constructor() {
    this.translateService.setDefaultLang('en');
    this.translateService.setTranslation('en', en);
    this.translateService.use('en');
    this.isDarkMode = localStorage.getItem('quiz-theme') === 'dark';
    this.applyThemeMode(this.isDarkMode);

    this.headerUiService.quizMeta$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((meta) => {
        this.bannerTitle = meta?.title ?? '';
        this.bannerIcon = meta?.icon ?? '';
      });

    this.updateBodyPageClass();
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.updateBodyPageClass();
        this.showQuizMeta = this.router.url.startsWith('/quiz-questions/');
      });

    this.showQuizMeta = this.router.url.startsWith('/quiz-questions/');
  }

  private updateBodyPageClass() {
    const body = this.document?.body;
    if (!body) {
      return;
    }

    body.classList.forEach((className) => {
      if (className.startsWith('page-')) {
        body.classList.remove(className);
      }
    });

    const routePath = this.router.url.split('?')[0].replace(/^\/+|\/+$/g, '');
    const firstSegment = routePath.split('/').find(Boolean);
    const pageSlug = this.sanitizeSlug(firstSegment || 'home');
    body.classList.add(`page-${pageSlug}`);
  }

  private sanitizeSlug(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  onThemeModeChange(isDarkMode: boolean): void {
    this.isDarkMode = isDarkMode;
    localStorage.setItem('quiz-theme', isDarkMode ? 'dark' : 'light');
    this.applyThemeMode(isDarkMode);
  }

  private applyThemeMode(isDarkMode: boolean): void {
    this.document.body.classList.toggle('quiz-theme-dark', isDarkMode);
  }
}
