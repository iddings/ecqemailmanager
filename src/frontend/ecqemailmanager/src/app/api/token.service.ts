import { Injectable } from '@angular/core';
import {Observable} from "rxjs/internal/Observable";
import {ReplaySubject} from "rxjs";
import {filter, first, map} from "rxjs/operators";
import * as moment from "moment";

interface BaseToken<T> {
  token: string,
  expires: T
}

interface BaseTokenPair<T> {
  access: T
  refresh: T
}

export type RawToken = BaseToken<number>;
export type Token = BaseToken<moment.Moment>;

export type RawTokenPair = BaseTokenPair<RawToken>;
export type TokenPair = BaseTokenPair<Token>;

@Injectable()
export class TokenService {

  private readonly _tokenKey = 'ecq_tokens';

  private _tokens: TokenPair;

  private _tokenObservable = new ReplaySubject<TokenPair>();

  constructor() {

    this._tokens = {
      access: null,
      refresh: null
    };

    const tokens: RawTokenPair = JSON.parse(
      localStorage.getItem(this._tokenKey)
    );

    // noinspection SuspiciousTypeOfGuard
    if (tokens && tokens.access && typeof tokens.access !== 'string')
      this.access(tokens.access);

    // noinspection SuspiciousTypeOfGuard
    if (tokens && tokens.refresh && typeof tokens.refresh !== 'string')
      this.refresh(tokens.refresh);

  }

  private _tokenToRaw(token: Token): RawToken {

    if (!token) return;

    return {
      token: token.token,
      expires: token.expires.valueOf()
    };

  }

  private _saveTokensToStorage() {
    localStorage.setItem(this._tokenKey, JSON.stringify({
      access: this._tokenToRaw(this.access()),
      refresh: this._tokenToRaw(this.refresh())
    }));
  }

  private _getSetToken(type: keyof BaseTokenPair<any>, token: Token|RawToken): Token {

    if (!token) return this._tokens[type];

    if (typeof token.expires === 'number')
      token.expires = moment(token.expires);
    this._tokens[type] = token as Token;

    this._saveTokensToStorage();
    this._tokenObservable.next(this._tokens);

  }

  private _checkValidity(tokens: TokenPair): boolean {
    return tokens.access && tokens.refresh &&
      tokens.refresh.expires.isAfter(moment());
  }

  public access = (token?: Token|RawToken) => this._getSetToken('access', token);

  public refresh = (token?: Token|RawToken) => this._getSetToken('refresh', token);

  public invalidate(){

    this._tokens = {
      access: null,
      refresh: null
    };

    this._saveTokensToStorage();

  }

  public whenTokensValid = (): Observable<TokenPair> =>
    this._tokenObservable
      .pipe(filter(tokens => this._checkValidity(tokens)));

  public tokensAreValid = (): boolean => this._checkValidity(this._tokens);

}
