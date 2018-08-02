import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {Macro, MacroService} from "../../macro/macro.service";
import {DialogsService} from "../dialogs/dialogs.service";
import {ParsedSchedule} from "../../macro/schedule";
import {filter} from "rxjs/operators";
import {FormControl} from "@angular/forms";
import {Subscription} from "rxjs/internal/Subscription";

@Component({
  selector: 'editor-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnChanges{

  @Input() macro: Macro;

  enabledControl = new FormControl();

  private _dataSubscription: Subscription;

  constructor(public $wizards: DialogsService) {

    this.$wizards
      .whenWizardCompleted()
      .pipe(filter(res => !!res))
      .subscribe((res: ParsedSchedule) => this.macro.commitChanges({schedule: res.toCron()}));

    this.enabledControl.valueChanges
      .subscribe(value => {
        this.macro.commitChanges({
          enabled: value
        });
      });

  }

  ngOnChanges() {

    if (this._dataSubscription)
      this._dataSubscription.unsubscribe();

    this._dataSubscription = this.macro.stateChanged()
      .subscribe(() => this._updateEnabledControl());

    this._updateEnabledControl();

  }

  private _updateEnabledControl() {
    this.enabledControl.patchValue(this.macro.state.enabled, {
      emitEvent: false
    });
  }

}
