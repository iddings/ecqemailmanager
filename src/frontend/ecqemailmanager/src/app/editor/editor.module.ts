import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {
  MatButtonModule, MatChipsModule,
  MatIconModule, MatInputModule,
  MatListModule, MatSelectModule,
  MatSlideToggleModule, MatTooltipModule, MatAutocompleteModule
} from "@angular/material";
import {MacroModule} from "../macro/macro.module";
import {EditorComponent} from "./editor.component";
import {EmailComponent} from "./email/email.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ScheduleComponent} from "./schedule/schedule.component";
import {TasksComponent} from "./tasks/tasks.component";
import {DialogsModule} from "./dialogs/dialogs.module";
import {SearchPipeModule} from "../search-pipe/search-pipe.module";
import {SortPipeModule} from "../sort-pipe/sort-pipe.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatAutocompleteModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTooltipModule,

    SearchPipeModule,
    SortPipeModule,

    MacroModule,
    DialogsModule
  ],
  declarations: [
    EditorComponent,
    EmailComponent,
    ScheduleComponent,
    TasksComponent
  ],
  exports: [
    EditorComponent
  ]
})
export class EditorModule { }
