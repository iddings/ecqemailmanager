import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material";
import {Schedule} from "../../../models";
import {DATE_OPTIONS, HourlySchedule} from "../../../macro/schedule";

@Component({
  templateUrl: './hourly-wizard.component.html',
  styleUrls: ['./hourly-wizard.component.scss']
})
export class HourlyWizardComponent {

  readonly WEEKDAYS = DATE_OPTIONS.WEEKDAYS;

  schedule: HourlySchedule;

  constructor(@Inject(MAT_DIALOG_DATA) initialSchedule: Schedule) {
    this.schedule = HourlySchedule.fromCron(initialSchedule);
  }

}
