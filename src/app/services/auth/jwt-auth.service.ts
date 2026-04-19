import { inject, Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { messagesFromAuthHttpError } from './auth-http-error';

export interface JwtUser {
  email: string;
  uid: string;
  username?: string;
}

export interface JwtAuthResponse {
  token: string;
  user: JwtUser;
}

@Injectable({
  providedIn: 'root'
})
export class JwtAuthService {
  private readonly httpClient = inject(HttpClient);
  private readonly tokenKey = 'jwt_token';
  private readonly userKey = 'jwt_user';
  
  private userSubject = new BehaviorSubject<JwtUser | null>(this.getStoredUser());
  public user$ = this.userSubject.asObservable();
  public isLogged$ = this.user$.pipe(map(user => !!user));

  constructor() {
    // Check if token is expired on init
    const token = this.getToken();
    if (token && this.isTokenExpired(token)) {
      this.logout();
    }
  }

  login(email: string, password: string): Observable<{ isSuccess: boolean; errors: string[] }> {
    return this.httpClient.post<JwtAuthResponse>(`${environment.apiUrl}/auth/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        this.storeToken(response.token);
        this.storeUser(response.user);
        this.userSubject.next(response.user);
      }),
      map(() => ({ isSuccess: true, errors: [] })),
      catchError((error): Observable<{ isSuccess: boolean; errors: string[] }> => {
        if (isDevMode()) {
          console.error('[JWT auth] login failed', error);
        }
        return of({ isSuccess: false, errors: messagesFromAuthHttpError(error) });
      })
    );
  }

  register(username: string, email: string, password: string): Observable<{ isSuccess: boolean; errors: string[] }> {
    return this.httpClient.post<JwtAuthResponse>(`${environment.apiUrl}/auth/register`, {
      username,
      email,
      password
    }).pipe(
      tap(response => {
        this.storeToken(response.token);
        this.storeUser(response.user);
        this.userSubject.next(response.user);
      }),
      map(() => ({ isSuccess: true, errors: [] })),
      catchError((error): Observable<{ isSuccess: boolean; errors: string[] }> => {
        if (isDevMode()) {
          console.error('[JWT auth] register failed', error);
        }
        return of({ isSuccess: false, errors: messagesFromAuthHttpError(error) });
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.userSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): JwtUser | null {
    return this.getStoredUser();
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private storeUser(user: JwtUser): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  private getStoredUser(): JwtUser | null {
    const userStr = localStorage.getItem(this.userKey);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= exp;
    } catch {
      return true;
    }
  }
}

