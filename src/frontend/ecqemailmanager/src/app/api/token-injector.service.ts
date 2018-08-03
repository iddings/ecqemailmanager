import { Injectable } from '@angular/core';
import {TokenPair, RawTokenPair, TokenService} from "./token.service";
import {HttpClient, HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {of, throwError} from "rxjs/index";
import {ActivatedRoute, Router} from "@angular/router";
import {catchError, flatMap} from "rxjs/operators";
import {ApiErrorResponse, ApiResponse} from "./api.service";

@Injectable()
export class TokenInjectorService implements HttpInterceptor {

  constructor(
    private $http: HttpClient,
    private $router: Router,
    private $route: ActivatedRoute,
    private $token: TokenService
  ) { }

  private _injectAccessToken(req: HttpRequest<any>) {
    return req.clone({
      setHeaders: {Authorization: `Bearer ${this.$token.access().token}`}
    })
  }

  private _injectRefreshToken(req: HttpRequest<any>) {
    return req.clone({
      setHeaders: {Authorization: `Bearer ${this.$token.refresh().token}`}
    })
  }

  private _interceptResponse(err: HttpErrorResponse, originalReq: HttpRequest<any>, handler: HttpHandler) {

    let errorResponseCode = (err.error as ApiErrorResponse).response.code;

    if (this._isApiRequest(originalReq.url, 'auth/refresh')) {
      this.$token.invalidate();
      this._redirectToLogin();
      return throwError(err);
    }

    if (Math.floor(errorResponseCode / 100) === 1) {

      return this.$http
        .post<ApiResponse<Partial<RawTokenPair>>>('/api/auth/refresh', {})
        .pipe(
          flatMap(resp => {
            this.$token.access(resp.response.access);
            return handler.handle(this._injectAccessToken(originalReq));
          })
        )
    }

    return throwError(err);

  }

  private _redirectToLogin(next: string='') {
    this.$router.navigateByUrl('login');
  }

  private _isApiRequest(url: string, checkSuffix: string='.*?') {
    const locationPrefix = `^(${location.protocol}//${location.host})?/?`;
    return url.match(new RegExp(`${locationPrefix}api/${checkSuffix}$`));
  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {


    if (this._isApiRequest(req.url, 'auth'))
      return next.handle(req);

    if (this._isApiRequest(req.url, 'auth/refresh'))
      req = this._injectRefreshToken(req);

    else if (this._isApiRequest(req.url)) {

      if (this.$token.tokensAreValid())
        req = this._injectAccessToken(req);

      else {
        this._redirectToLogin();
        return throwError('not logged in');
      }

    }

    let handler = next.handle(req);
    return handler.pipe(catchError(e => this._interceptResponse(e, req, next)));

  }

}
