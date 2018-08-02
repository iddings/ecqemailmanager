import {Routes} from "@angular/router";
import {LoginComponent} from "./login.component";
import {HomeComponent} from "./home.component";
import {MacroResolverService} from "./macro-resolver.service";

export const ROUTES: Routes = [
  {
    path: '', component: HomeComponent, pathMatch: 'full'
  },
  {
    path: 'r/:name/:id',
    component: HomeComponent,
    resolve: {
      macro: MacroResolverService
    }
  },
  { path: 'login', component: LoginComponent }
];
