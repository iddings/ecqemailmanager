import { Pipe, PipeTransform } from '@angular/core';
import {Schedule} from "../models";
import {DailySchedule, HourlySchedule, MonthlySchedule} from "./schedule";

@Pipe({
  name: 'scheduleDescription',
  pure: false
})
export class ScheduleDescriptionPipe implements PipeTransform {

  transform(cronSchedule: Schedule): any {

    // Check daily first, because the set of all hourly schedules is a superset of the set of all daily schedules

    if (DailySchedule.cronIsValid(cronSchedule)) {
      return DailySchedule.fromCron(cronSchedule).toText();
    }

    if (HourlySchedule.cronIsValid(cronSchedule)) {
      return HourlySchedule.fromCron(cronSchedule).toText();
    }

    if (MonthlySchedule.cronIsValid(cronSchedule)) {
      return MonthlySchedule.fromCron(cronSchedule).toText();
    }

    return "never, schedule is not set, or is invalid";

  }

}
