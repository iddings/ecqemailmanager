import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from "@angular/router";
import {Macro, MacroService} from "./macro/macro.service";
import {Observable} from "rxjs/internal/Observable";
import {first, map} from "rxjs/operators";

@Injectable()
export class MacroResolverService implements Resolve<Macro> {

  constructor(private $macro: MacroService, private $router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Macro> {

    return this.$macro.all()
      .pipe(
        first(),
        map(all => {
          for (let macro of all)
            if (macro.state.id === parseInt(route.paramMap.get('id'))) {
              return macro;
            }
          this.$router.navigate(['']);

        })
      );

  }

}
