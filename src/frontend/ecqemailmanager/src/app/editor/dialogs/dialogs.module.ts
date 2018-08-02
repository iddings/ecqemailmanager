import {NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {DailyWizardComponent} from "./daily-wizard/daily-wizard.component";
import {DialogsService} from "./dialogs.service";
import {
  MAT_DIALOG_DATA,
  MatButtonModule,
  MatCheckboxModule,
  MatDialogModule,
  MatInputModule, MatListModule, MatRadioModule, MatSelectModule,
  MatSlideToggleModule
} from "@angular/material";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { ConfirmComponent } from './confirm/confirm.component';
import { ProgressComponent } from './progress/progress.component';
import {HourlyWizardComponent} from "./hourly-wizard/hourly-wizard.component";
import {MonthlyWizardComponent} from "./monthly-wizard/monthly-wizard.component";
import {AppDataModule} from "../../app-data/app-data.module";
import { ImportNewReportComponent } from './import-new-report/import-new-report.component';
import {ChooseReportFileComponent} from "./choose-report-file/choose-report-file.component";
import {SearchPipeModule} from "../../search-pipe/search-pipe.module";
import {BasicPromptComponent} from "./basic-prompt/basic-prompt.component";


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatInputModule,
    MatListModule,
    MatRadioModule,
    MatSelectModule,
    MatSlideToggleModule,

    AppDataModule,
    SearchPipeModule
  ],
  declarations: [
    BasicPromptComponent,
    ConfirmComponent,
    DailyWizardComponent,
    HourlyWizardComponent,
    MonthlyWizardComponent,
    ChooseReportFileComponent,
    ProgressComponent,
    ImportNewReportComponent
  ],
  entryComponents: [
    BasicPromptComponent,
    ConfirmComponent,
    DailyWizardComponent,
    HourlyWizardComponent,
    MonthlyWizardComponent,
    ChooseReportFileComponent,
    ProgressComponent
  ],
  providers: [
    DialogsService
  ]
})
export class DialogsModule { }
