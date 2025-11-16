import { inject, Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, from, map, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { AuthService } from '../../services/auth/auth.service';

export interface RegisterResult {
  isSuccess: boolean;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private readonly httpClient = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly firebaseAuth = environment.authType === 'FIREBASE' ? inject(Auth, { optional: true }) : null;

  register(username: string, email: string, password: string): Observable<RegisterResult> {
    // Use JWT auth if configured
    if (environment.authType === 'JWT') {
      return this.authService.register(username, email, password);
    }

    // Firebase registration (original logic)
    if (!this.firebaseAuth) {
      return of({
        isSuccess: false,
        errors: ['Firebase auth not available']
      });
    }

    return from(
      createUserWithEmailAndPassword(
        this.firebaseAuth,
        email,
        password
      )
    ).pipe(
      catchError((err) => {
        return of({
          isSuccess: false,
          errors: ['The registration by firebase failed, with the following error : ' + JSON.stringify(err)]
        });
      }),
      switchMap((u) =>
        this.httpClient.post(`${environment.apiUrl}/users`, {
          username
        }).pipe(map(() => ({
            isSuccess: true,
            errors: []
          })),
          catchError((err) => {
              return of({
                isSuccess: false,
                errors: ['The registration by firebase succeeded, but the registration by the backend failed, with the following error : ' + JSON.stringify(err)]
              });
            }
          ))
      )
    );
  }
}
