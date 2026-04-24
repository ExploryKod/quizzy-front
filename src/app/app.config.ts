import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

const baseProviders: any[] = [
  provideRouter(appRoutes, withComponentInputBinding()),
  provideAnimations(),
  provideHttpClient(),
  importProvidersFrom([TranslateModule.forRoot()])
];

export const appConfig: ApplicationConfig = {
  providers: baseProviders
};
