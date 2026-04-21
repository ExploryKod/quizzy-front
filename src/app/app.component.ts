import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { HeaderComponent } from './components/layouts/header/header.component';
import { TranslateService } from '@ngx-translate/core';
import { fr } from './translations/fr';
import { filter } from 'rxjs';

@Component({
  standalone: true,
  imports: [RouterModule, HeaderComponent],
  selector: 'qzy-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly translateService = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  title = 'quizzy-front';

  constructor() {
    this.translateService.setDefaultLang('fr');
    this.translateService.setTranslation('fr', fr);
    this.translateService.use('fr');

    this.updateBodyPageClass();
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.updateBodyPageClass());
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
}
