import {Router, RouterModule, Routes} from "@angular/router";
import {LoginComponent} from "./login.component";
import {HomeComponent} from "./home.component";
import {MacroResolverService} from "./macro-resolver.service";
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

const routes: Routes = [
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

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ],
  providers: [
    MacroResolverService
  ]
})
export class AppRoutingModule {}
