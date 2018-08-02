import { Injectable } from '@angular/core';
import {Tokens, TokenService} from "./token.service";
import {HttpClient, HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {throwError} from "rxjs/index";
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
      setHeaders: {Authorization: `Bearer ${this.$token.access}`}
    })
  }

  private _injectRefreshToken(req: HttpRequest<any>) {
    return req.clone({
      setHeaders: {Authorization: `Bearer ${this.$token.refresh}`}
    })
  }

  private _interceptResponse(err: HttpErrorResponse, originalReq: HttpRequest<any>, handler: HttpHandler) {

    let errorResponseCode = (err.error as ApiErrorResponse).response.code;

    if (this._isApiRequest(originalReq.url, true)) {
      this.$route.url
        .subscribe(url => this._redirectToLogin(url[0].path));
      this._redirectToLogin();
      return throwError(err);
    }

    if (Math.floor(errorResponseCode / 100) === 1) {

      return this.$http
        .post<ApiResponse<Tokens>>('/api/auth/refresh', {})
        .pipe(
          flatMap(resp => {
            this.$token.access = resp.response.access;
            return handler.handle(this._injectAccessToken(originalReq));
          })
        )
    }

    return throwError(err);

  }

  private _redirectToLogin(next?: string) {
    console.log(next);
    this.$router.navigate(['login'], {
        queryParams: {
          next: next
        }
      });
  }

  private _isApiRequest(url: string, checkIsRefresh: boolean=false) {
    const locationPrefix = `^(${location.protocol}//${location.host})?/?`;
    if (checkIsRefresh)
      return url.match(new RegExp(`${locationPrefix}api/auth/refresh$`));
    return url.match(new RegExp(`${locationPrefix}api(/.*)?`));
  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (this._isApiRequest(req.url, true))
      req = this._injectRefreshToken(req);
    else if (this._isApiRequest(req.url))
      req = this._injectAccessToken(req);
    let handler = next.handle(req);
    return handler.pipe(catchError(e => this._interceptResponse(e, req, next)))
  }

}
