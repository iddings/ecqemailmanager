import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, Router} from '@angular/router';
import {TokenService} from "./token.service";

@Injectable()
export class LoginGuard implements CanActivate {

  constructor(private $tokens: TokenService, private $router: Router) {}

  canActivate(next: ActivatedRouteSnapshot){
    const valid = this.$tokens.tokensAreValid();
    if (!valid) {
      this.$router.navigate(['login']);
    }
    return valid;
  }

}
