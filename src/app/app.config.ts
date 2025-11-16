import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../environments/environment';
import { authInterceptor } from './services/auth/auth-interceptor.service';
import { SocketIoModule } from 'ngx-socket-io';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';

const baseProviders: any[] = [
  provideRouter(appRoutes, withComponentInputBinding()),
  provideAnimations(),
  provideHttpClient(withInterceptors([authInterceptor])),
  importProvidersFrom([
    TranslateModule.forRoot(),
    SocketIoModule.forRoot({ url: environment.baseUrl }),
  ])
];

// Conditionally include Firebase providers only if using Firebase auth
if (environment.authType === 'FIREBASE') {
  baseProviders.push(
    importProvidersFrom([
      provideFirebaseApp(() => initializeApp(environment.firebase)),
      provideAuth(() => getAuth()),
    ])
  );
}

export const appConfig: ApplicationConfig = {
  providers: baseProviders
};
