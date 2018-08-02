import * as moment from 'moment';
import {Schedule} from "../models";
import {
  ALL,
  booleanToNumeric,
  combineCronField,
  numericToBoolean,
  ordinal,
  prettyJoin,
  range,
  splitCronField
} from "./helpers";

const TIME_FORMAT24 = 'HH:mm';
const TIME_FORMAT12 = 'hh:mm a';

export const DATE_OPTIONS = {
  DAYS: [undefined, ...range(1,31)],
  HOURS: range(0,23),
  MINUTES: range(0,59),
  MODES: ['Monthly', 'Daily'],
  WEEKDAYS: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
};


export interface ParsedSchedule {
  toCron(): Schedule
  toText(): string
}

export class DailySchedule implements ParsedSchedule{

  public daysOfWeek: boolean[] = [true, true, true, true, true, false, false];

  private hour: number = 8;
  private minute: number = 0;

  public get time() {
    return moment().hour(this.hour).minute(this.minute).format(TIME_FORMAT24);
  }

  public set time(value: string) {
    const time = moment(value, TIME_FORMAT24);
    this.hour = time.hour();
    this.minute = time.minute();
  }

  public toCron() {
    return {
      day: ALL,
      day_of_week: combineCronField(booleanToNumeric(this.daysOfWeek)),
      hour: this.hour.toString(),
      minute: this.minute.toString()
    }
  }

  public toText() {
    return `every ${
      prettyJoin(
        this.daysOfWeek
          .map((v,i) => ({value: v, index: i}))
          .filter(o => o.value)
          .map(o => DATE_OPTIONS.WEEKDAYS[o.index].substr(0, 3))
      )
    } at ${
      moment().hour(this.hour).minute(this.minute).format(TIME_FORMAT12)
    }`;
  }

  private static _fromCronStrict(cron: Schedule): DailySchedule {

    const sch = new DailySchedule(),
      days = splitCronField(cron.day),
      days_of_week = splitCronField(cron.day_of_week),
      hours = splitCronField(cron.hour),
      minute = parseInt(cron.minute);

    // valid daily schedule will have the following:
    // day === ALL
    // days_of_week: number[] {0 <= length <= 7}
    // hours: number[] {length === 1}
    // minute: number

    if (
      days === ALL &&
      typeof days_of_week === 'object' && days_of_week.length <= 7 &&
      typeof hours === 'object' && hours.length === 1 &&
      !isNaN(minute)
    ) {
      sch.daysOfWeek = numericToBoolean(days_of_week, DATE_OPTIONS.WEEKDAYS);
      sch.hour = hours[0];
      sch.minute = minute;
    }

    else throw new TypeError('cron schedule is not a valid daily schedule');

    return sch;

  }

  public static cronIsValid(cron: Schedule): boolean {

    try {
      DailySchedule._fromCronStrict(cron);
      return true;
    }
    catch {
      return false;
    }

  }

  public static fromCron(cron: Schedule): DailySchedule {

    try {
      return DailySchedule._fromCronStrict(cron);
    }

    catch {
      return new DailySchedule();
    }

  }

}

export class HourlySchedule implements ParsedSchedule {

  public daysOfWeek: boolean[] = [true, true, true, true, true, false, false];
  public frequency: number = 2;

  private start: moment.Moment = moment('08:00', TIME_FORMAT24);
  private end: moment.Moment = moment('17:00', TIME_FORMAT24);

  public get startTime() {
    return this.start.format(TIME_FORMAT24);
  }

  public set startTime(value: string) {
    this.start = moment(value, TIME_FORMAT24);
  }

  public get endTime() {
    return this.end.format(TIME_FORMAT24);
  }

  public set endTime(value: string) {
    this.end = moment(value, TIME_FORMAT24);
  }

  public toCron() {

    const hours = [],
      startClone = this.start.clone().second(0),
      endClone = this.end.clone().second(1);

    for (;startClone <= endClone; startClone.add(this.frequency, 'h'))
      hours.push(startClone.hour());

    return {
      day: ALL,
      day_of_week: combineCronField(booleanToNumeric(this.daysOfWeek)),
      hour: combineCronField(hours),
      minute: this.start.minute().toString()
    };

  }

  public toText() {
    return `every ${this.frequency} hours between ${
      this.start.format(TIME_FORMAT12)
    } and ${
      this.end.format(TIME_FORMAT12)
    } on ${
      prettyJoin(
        this.daysOfWeek
          .map((v,i) => ({value: v, index: i}))
          .filter(o => o.value)
          .map(o => DATE_OPTIONS.WEEKDAYS[o.index].substr(0, 3))
      )
    }`;
  }

  private static _fromCronStrict(cron: Schedule): HourlySchedule {

    const sch = new HourlySchedule(),
      days = splitCronField(cron.day),
      days_of_week = splitCronField(cron.day_of_week),
      hours = splitCronField(cron.hour),
      minute = parseInt(cron.minute);

    // valid hourly schedule will have the following:
    // day === ALL
    // days_of_week: number[] {0 <= length <= 7}
    // hours: number[]
    // minute: number

    if (
      days === ALL &&
      typeof days_of_week === 'object' && days_of_week.length <= 7 &&
      typeof hours === 'object' &&
      !isNaN(minute)
    ) {
      sch.daysOfWeek = numericToBoolean(days_of_week, DATE_OPTIONS.WEEKDAYS);
      sch.start = moment().hour(hours[0]).minute(minute).second(0);
      sch.end = moment().hour(hours[hours.length - 1]).minute(minute).second(0);
      sch.frequency = hours.length > 1 ? hours[1] - hours[0] : 1;
    }

    else throw new TypeError('cron schedule is not a valid hourly schedule');

    return sch;

  }

  public static cronIsValid(cron: Schedule): boolean {

    try {
      HourlySchedule._fromCronStrict(cron);
      return true;
    }
    catch {
      return false;
    }

  }

  public static fromCron(cron: Schedule): HourlySchedule {

    try {
      return HourlySchedule._fromCronStrict(cron);
    }

    catch {
      return new HourlySchedule();
    }

  }

}

export class MonthlySchedule implements ParsedSchedule{

  public days: boolean[] = numericToBoolean([], DATE_OPTIONS.DAYS);

  private hour: number = 8;
  private minute: number = 0;

  public get time() {
    return moment().hour(this.hour).minute(this.minute).format(TIME_FORMAT24);
  }

  public set time(value: string) {
    const time = moment(value, TIME_FORMAT24);
    this.hour = time.hour();
    this.minute = time.minute();
  }

  public toCron() {
    return {
      day: combineCronField(booleanToNumeric(this.days)),
      day_of_week: ALL,
      hour: this.hour.toString(),
      minute: this.minute.toString()
    }
  }

  public toText() {
    return `at ${
      moment().hour(this.hour).minute(this.minute).format(TIME_FORMAT12)
    } on the ${
      prettyJoin(
        this.days
          .map((v,i) => ({value: v, index: i}))
          .filter(o => o.value)
          .map(o => `${o.index}${ordinal(o.index)}`)
      )
    } day of each month`
  }

  private static _fromCronStrict(cron: Schedule): MonthlySchedule {

    const sch = new MonthlySchedule(),
      days = splitCronField(cron.day),
      days_of_week = splitCronField(cron.day_of_week),
      hours = splitCronField(cron.hour),
      minute = parseInt(cron.minute);

    // valid monthy schedule will have the following:
    // day: number[]
    // days_of_week === ALL
    // hours: number[] {length === 1}
    // minute: number

    if (
      typeof days === 'object' &&
      days_of_week === ALL &&
      typeof hours === 'object' && hours.length === 1 &&
      !isNaN(minute)
    ) {
      sch.days = numericToBoolean(days, DATE_OPTIONS.DAYS);
      sch.hour = hours[0];
      sch.minute = minute;
    }

    else throw new TypeError('cron schedule is not a valid monthly schedule');

    return sch;

  }

  public static cronIsValid(cron: Schedule): boolean {

    try {
      MonthlySchedule._fromCronStrict(cron);
      return true;
    }
    catch {
      return false;
    }

  }

  public static fromCron(cron: Schedule): MonthlySchedule {

    try {
      return MonthlySchedule._fromCronStrict(cron);
    }

    catch {
      return new MonthlySchedule();
    }

  }

}
