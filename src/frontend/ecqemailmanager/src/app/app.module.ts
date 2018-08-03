import { NgModule } from '@angular/core';
import {SearchPipeModule} from "./search-pipe/search-pipe.module";
import {
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatSidenavModule,
  MatToolbarModule
} from "@angular/material";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {ReactiveFormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {ApiModule} from "./api/api.module";
import {EditorModule} from "./editor/editor.module";
import {MacroModule} from "./macro/macro.module";
import {AppComponent} from "./app.component";
import {HomeComponent} from "./home.component";
import {LoginComponent} from "./login.component";
import {MacroResolverService} from "./macro-resolver.service";
import {SortPipeModule} from "./sort-pipe/sort-pipe.module";
import {AppRoutingModule} from "./app-routing.module";

@NgModule({
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    ReactiveFormsModule,

    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,

    AppRoutingModule,
    ApiModule,
    SearchPipeModule,
    SortPipeModule,
    EditorModule,
    MacroModule
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
