import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material";
import {DATE_OPTIONS, MonthlySchedule} from "../../../macro/schedule";
import {Schedule} from "../../../models";

@Component({
  templateUrl: './monthly-wizard.component.html',
  styleUrls: ['./monthly-wizard.component.scss']
})
export class MonthlyWizardComponent {

  readonly DAYS = DATE_OPTIONS.DAYS;

  schedule: MonthlySchedule;

  constructor(@Inject(MAT_DIALOG_DATA) initialSchedule: Schedule) {
    this.schedule = MonthlySchedule.fromCron(initialSchedule);
  }


}
