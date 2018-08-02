import { Injectable } from '@angular/core';
import {MatDialog} from "@angular/material";
import {DailyWizardComponent} from "./daily-wizard/daily-wizard.component";
import {Observable} from "rxjs/internal/Observable";
import {Subject} from "rxjs/internal/Subject";
import {filter} from "rxjs/operators";
import {ConfirmComponent} from "./confirm/confirm.component";
import {ProgressComponent} from "./progress/progress.component";
import {MonthlyWizardComponent} from "./monthly-wizard/monthly-wizard.component";
import {HourlyWizardComponent} from "./hourly-wizard/hourly-wizard.component";
import {BasicPromptComponent} from "./basic-prompt/basic-prompt.component";
import {ChooseReportFileComponent} from "./choose-report-file/choose-report-file.component";
import {Schedule} from "../../models";
import {ParsedSchedule} from "../../macro/schedule";


interface WizardsInterface {
  daily: any
  monthly: any
  hourly: any
}

const WIZARDS: WizardsInterface = {
  daily: DailyWizardComponent,
  monthly: MonthlyWizardComponent,
  hourly: HourlyWizardComponent
};

@Injectable()
export class DialogsService {

  private _wizardResults = new Subject<ParsedSchedule>();

  constructor(private $dialog: MatDialog) {}

  openWizard(wizardName: keyof WizardsInterface, data: Schedule) {
    this.$dialog.open(WIZARDS[wizardName], {
      data: data,
      disableClose: true
    })
      .afterClosed()
      .subscribe((res: ParsedSchedule) => this._wizardResults.next(res));
  }

  whenWizardCompleted = (): Observable<ParsedSchedule> => this._wizardResults;

  confirm(data: {title: string, content: string}) {

    let dialogClosed = this.$dialog.open(ConfirmComponent, {
      data: data,
      disableClose: true
    }).afterClosed();

    return {
      whenConfirmed: dialogClosed.pipe(filter(r => !!r)),
      whenCanceled: dialogClosed.pipe(filter(r => !r))
    };

  }

  progress(data: {title: string, content: string}) {

    let dialogRef = this.$dialog.open(ProgressComponent, {
      data: data,
      disableClose: true
    });

    return {
      close: () => dialogRef.close()
    };

  }

  basicPrompt(data: {title: string, content: string, value?: string}) {

    let dialogClosed = this.$dialog.open(BasicPromptComponent, {
      data: data,
      disableClose: true
    }).afterClosed();

    return {
      whenCompleted: dialogClosed.pipe(filter(r => !!r)),
      whenCanceled: dialogClosed.pipe(filter(r => !r))
    };

  }

  chooseReportFile = ({importNew = false, selected = null}: {importNew?: boolean, selected?: string} = {}) =>
    this.$dialog.open(ChooseReportFileComponent, {
      disableClose: true,
      data: {
        importNew: importNew,
        selected: selected
      }
    });



}
