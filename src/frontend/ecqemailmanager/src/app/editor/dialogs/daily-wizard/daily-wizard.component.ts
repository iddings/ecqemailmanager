import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material";
import {Schedule} from "../../../models";
import {DailySchedule, DATE_OPTIONS} from "../../../macro/schedule";

@Component({
  templateUrl: './daily-wizard.component.html',
  styleUrls: ['./daily-wizard.component.scss']
})
export class DailyWizardComponent {

  readonly WEEKDAYS = DATE_OPTIONS.WEEKDAYS;

  schedule: DailySchedule;

  constructor(@Inject(MAT_DIALOG_DATA) initialSchedule: Schedule) {
    this.schedule = DailySchedule.fromCron(initialSchedule);
  }

}
