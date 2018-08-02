import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {MacroData, AppData, ReportFile} from "../models";
import {catchError, map} from "rxjs/operators";
import {Tokens, TokenService} from "./token.service";
import {of} from "rxjs/internal/observable/of";

export interface ApiResponse<T> {
  response: T
  message: string
  success: boolean
}

export type ApiErrorResponse = ApiResponse<{
  code: number
  description: string
}>

const extractResponse = <T>(resp: ApiResponse<T>): T => {
  return resp.response
};

@Injectable()
export class ApiService {

  constructor(private $http: HttpClient, private $tokens: TokenService) {}

  login = (username: string, password: string) =>
    this.$http
      .post<ApiResponse<Tokens>>('/api/auth', {
        username: username,
        password: password
      })
      .pipe(
        map(resp => {
          this.$tokens.access = resp.response.access;
          this.$tokens.refresh = resp.response.refresh;
          return resp;
        }),
        catchError((err: HttpErrorResponse) =>
          of(err.error as ApiErrorResponse)
        )
      );

  allMacros = () =>
    this.$http
      .get<ApiResponse<MacroData[]>>('/api/macro')
      .pipe(map(extractResponse));

  appData = () =>
    this.$http
      .get<ApiResponse<AppData>>('/api/appData')
      .pipe(map(extractResponse));

  deleteMacro = (id: number) =>
    this.$http
      .delete<ApiResponse<string>>(`/api/macro/${id}`)
      .pipe(map(extractResponse));


  importFile = (user: string, report: string) =>
    this.$http
      .post<ApiResponse<ReportFile>>(`/api/userFolder/${user}/import/${report}`, null)
      .pipe(map(extractResponse));

  newMacro = (name: string) =>
    this.$http
      .post<ApiResponse<MacroData>>('/api/macro', {name: name})
      .pipe(map(extractResponse));

  runMacro = (id: number) =>
    this.$http
      .get<ApiResponse<string>>(`/api/macro/${id}/run`)
      .pipe(map(extractResponse));

  saveMacro = (macro: MacroData) =>
    this.$http
      .post<ApiResponse<MacroData>>(`/api/macro/${macro.id}`, macro)
      .pipe(map(extractResponse));

  userFiles = (user: string) =>
    this.$http
      .get<ApiResponse<string[]>>(`/api/userFolder/${user}`)
      .pipe(map(extractResponse));

  reloadFile = (file: ReportFile) =>
    this.$http
      .get<ApiResponse<string>>(`/api/file/${file.id}/reload`)
      .pipe(map(extractResponse));

}
