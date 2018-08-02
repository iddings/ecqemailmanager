import { NgModule } from '@angular/core';
import {ApiModule} from "../api/api.module";
import {MacroService} from "./macro.service";
import {ReportFromIdPipe} from "./report-from-id.pipe";
import { ScheduleDescriptionPipe } from './schedule-description.pipe';

@NgModule({
  imports: [
    ApiModule
  ],
  providers: [
    MacroService
  ],
  declarations: [
    ReportFromIdPipe,
    ScheduleDescriptionPipe
  ],
  exports: [
    ReportFromIdPipe,
    ScheduleDescriptionPipe
  ]
})
export class MacroModule {}
