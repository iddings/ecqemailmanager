import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from "@angular/router";
import {Macro, MacroService} from "./macro/macro.service";
import {Observable} from "rxjs/internal/Observable";
import {catchError, first, map} from "rxjs/operators";
import {of} from "rxjs/internal/observable/of";
import {throwError} from "rxjs/internal/observable/throwError";

@Injectable()
export class MacroResolverService implements Resolve<Macro> {

  constructor(private $macro: MacroService, private $router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Macro> {

    return this.$macro.getMacro(parseInt(route.paramMap.get('id')))
      .pipe(
        first(),
        map(macro => {

          console.log(macro);

          if (macro) return macro;

          //this.$router.navigate(['']);
          return null;

        })
      );

  }

}
