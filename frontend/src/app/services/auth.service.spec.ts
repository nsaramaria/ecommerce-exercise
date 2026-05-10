import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { API_BASE_URL } from '../config';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('starts logged out', () => {
    expect(service.isLoggedIn()).toBeFalse();
    expect(service.getToken()).toBeNull();
  });

  it('logs in and stores token', () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    service.login({ email: 'a@b.com', password: 'pw' }).subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({
      token: 'abc123', email: 'a@b.com', firstName: 'A', lastName: 'B', expiresAt: future
    });

    expect(service.isLoggedIn()).toBeTrue();
    expect(service.getToken()).toBe('abc123');
  });

  it('logout clears state', () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    service.login({ email: 'a@b.com', password: 'pw' }).subscribe();
    httpMock.expectOne(`${API_BASE_URL}/auth/login`).flush({
      token: 't', email: 'a@b.com', firstName: '', lastName: '', expiresAt: future
    });

    service.logout();
    expect(service.isLoggedIn()).toBeFalse();
    expect(service.getToken()).toBeNull();
  });
});
