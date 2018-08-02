import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {LoginGuard} from "./login.guard";
import {TokenService} from "./token.service";
import {TokenInjectorService} from "./token-injector.service";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {ApiService} from "./api.service";

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInjectorService,
      multi: true
    },
    ApiService,
    LoginGuard,
    TokenInjectorService,
    TokenService
  ]
})
export class ApiModule { }
