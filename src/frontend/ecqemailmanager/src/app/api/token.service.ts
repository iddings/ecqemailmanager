import { Injectable } from '@angular/core';
import {Observable} from "rxjs/internal/Observable";
import {ReplaySubject} from "rxjs/internal/ReplaySubject";
import {filter} from "rxjs/operators";

export interface Tokens {
  access: string,
  refresh: string
}

@Injectable()
export class TokenService {

  static _storageKey = "ecq_tokens";

  private _tokensUpdated = new ReplaySubject<Tokens>(1);

  get access() {
    return TokenService._tokens ? TokenService._tokens.access : null;
  }

  set access(value) {
    TokenService._tokens.access = value;
    TokenService._saveTokens();
    this._tokensUpdated.next(TokenService._tokens);
  }

  get refresh() {
    return TokenService._tokens ? TokenService._tokens.refresh : null;
  }

  set refresh(value) {
    TokenService._tokens.refresh = value;
    TokenService._saveTokens();
    this._tokensUpdated.next(TokenService._tokens);
  }

  private static _saveTokens() {
    localStorage.setItem(TokenService._storageKey, JSON.stringify(TokenService._tokens));
  }

  static _tokens: Tokens = null;

  whenTokensAreValid = (): Observable<any> =>
    this._tokensUpdated
      .pipe(
        filter(tokens => tokens.refresh.length > 0 && tokens.access.length > 0)
      );

}

const fromLocalStorage = localStorage.getItem(TokenService._storageKey);

if (fromLocalStorage) TokenService._tokens = JSON.parse(fromLocalStorage);

