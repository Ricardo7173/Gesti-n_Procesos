import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl +'/api/auth';

  constructor(private http: HttpClient, private router: Router, private jwtHelper: JwtHelperService) {}

  register(email: string, socialLogin: boolean) {
    return this.http.post(`${this.apiUrl}/register`, { email, socialLogin }).subscribe((response: any) => {
      const token = response.token;
      localStorage.setItem('token', token);
      this.router.navigate(['complete-registration']);
    });
  }

  verifyToken(token: string) {
    return this.http.post(`${this.apiUrl}/verify-token`, { token });
  }

  completeRegistration(userId: string, username: string, realName: string, avatar: string, password: string) {
    return this.http.post(`${this.apiUrl}/complete-registration`, { userId, username, realName, avatar, password }).
      pipe(tap((res: any) => {
        localStorage.setItem('token', res.token);
        this.router.navigate(['chat']);
      }));
  }

  login(email: string, password: string) {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        this.router.navigate(['chat']);
      }
    ));
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return token !== null && !this.jwtHelper.isTokenExpired(token);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['login']);
  }
}