import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {Macro, MacroService} from "../macro/macro.service";
import {DialogsService} from "./dialogs/dialogs.service";
import {Subscription} from "rxjs/internal/Subscription";
import {ActivatedRoute, Router} from "@angular/router";
import {debounceTime} from "rxjs/operators";



@Component({
  selector: 'editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnChanges{

  @Input() macro: Macro;

  private _autoSaveSubscription: Subscription;

  constructor(public $macro: MacroService, private $dialog: DialogsService, private $route: ActivatedRoute) {}

  ngOnChanges() {
    if (this._autoSaveSubscription)
      this._autoSaveSubscription.unsubscribe();

    if (this.macro)
      this._autoSaveSubscription = this.macro.stateChanged()
        .pipe(debounceTime(1000))
        .subscribe(() => this.$macro.saveMacro(this.macro));
  }

  deleteMacro(macro: Macro) {
    this.$dialog.confirm({
      title: `Delete Report '${macro.state.name}'?`,
      content: 'This cannot be undone!'
    })
      .whenConfirmed
      .subscribe(() =>
        this.$macro.deleteMacro(macro).subscribe()
      );
  }

  runMacro(macro: Macro) {
    this.$dialog.confirm({
      title: `Run Report '${macro.state.name}'?`,
      content: 'This report will be distributed to all email recipients'
    })
      .whenConfirmed
      .subscribe(() =>
        this.$macro.runMacro(macro).subscribe()
      );
  }

  editName() {
    this.$dialog.basicPrompt({
      title: 'Rename Distribution',
      content: '',
      value: this.macro.state.name
    })
      .whenCompleted
      .subscribe(name => {
        this.macro.commitChanges({
          name: name
        });
      })
  }

}
