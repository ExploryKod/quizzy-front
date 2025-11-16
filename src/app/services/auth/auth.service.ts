import { inject, Injectable, Optional } from '@angular/core';
import { Auth, authState, signInWithEmailAndPassword, User } from '@angular/fire/auth';
import { catchError, from, map, Observable, of, switchMap } from 'rxjs';
import { UserDetails } from './user-details';
import { UserService } from './user.service';
import { JwtAuthService, JwtUser } from './jwt-auth.service';
import { environment } from '../../../environments/environment';

export interface LoginResult {
  isSuccess: boolean;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authType = environment.authType || 'JWT';
  private readonly firebaseAuth = this.authType === 'FIREBASE' ? inject(Auth, { optional: true }) : null;
  private readonly userService = inject(UserService);
  private readonly jwtAuthService = inject(JwtAuthService);

  // Unified user observable
  user$: Observable<User | JwtUser | null> = this.authType === 'JWT' 
    ? this.jwtAuthService.user$
    : (this.firebaseAuth ? authState(this.firebaseAuth) : of(null));

  userDetails$: Observable<UserDetails | null> = this.user$.pipe(
    switchMap((user) => {
      if (!user) {
        return of(null);
      }
      if (this.authType === 'JWT') {
        const jwtUser = user as JwtUser;
        return of(new UserDetails(jwtUser.uid, jwtUser.email, jwtUser.username || ''));
      }
      return this.userService.getUser();
    })
  );

  isLogged$ = this.authType === 'JWT' 
    ? this.jwtAuthService.isLogged$
    : this.user$.pipe(map((user) => !!user));

  login(email: string, password: string): Observable<LoginResult> {
    if (this.authType === 'JWT') {
      return this.jwtAuthService.login(email, password);
    }
    
    // Firebase login
    if (!this.firebaseAuth) {
      return of({ isSuccess: false, errors: ['Firebase auth not available'] });
    }
    
    return from(signInWithEmailAndPassword(this.firebaseAuth, email, password))
      .pipe(
        map(() => ({ isSuccess: true, errors: [] })),
        catchError((error): Observable<LoginResult> => {
          if (error?.code === 'auth/invalid-credentials') {
            return of({ isSuccess: false, errors: ['Invalid credentials'] });
          }
          return of({ isSuccess: false, errors: [JSON.stringify(error)] });
        })
      );
  }

  register(username: string, email: string, password: string): Observable<LoginResult> {
    if (this.authType === 'JWT') {
      return this.jwtAuthService.register(username, email, password);
    }
    
    // Firebase registration (existing logic)
    if (!this.firebaseAuth) {
      return of({ isSuccess: false, errors: ['Firebase auth not available'] });
    }
    
    // This will be handled by RegisterService for Firebase
    return of({ isSuccess: false, errors: ['Use RegisterService for Firebase registration'] });
  }

  async logout(): Promise<void> {
    if (this.authType === 'JWT') {
      this.jwtAuthService.logout();
    } else if (this.firebaseAuth) {
      await this.firebaseAuth.signOut();
    }
  }

  // Helper method to get token for interceptor
  getToken(): Observable<string | null> {
    if (this.authType === 'JWT') {
      return of(this.jwtAuthService.getToken());
    }
    
    // Firebase token
    return this.user$.pipe(
      switchMap((user) => {
        if (!user || this.authType === 'JWT') {
          return of(null);
        }
        return from((user as User).getIdToken());
      })
    );
  }
}
