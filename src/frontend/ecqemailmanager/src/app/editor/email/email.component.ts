import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {COMMA, ENTER, SEMICOLON, SPACE, TAB} from "@angular/cdk/keycodes";
import {Subscription} from "rxjs";
import {Macro, MacroService} from "../../macro/macro.service";
import {debounceTime} from "rxjs/operators";
import {AppDataService} from "../../app-data/app-data.service";

const EMAIL_REGEXP =
    /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;

const SEPARATOR_REGEXP = /[\s,;]+/g;

@Component({
  selector: 'editor-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss']
})
export class EmailComponent implements OnChanges {

  private _dataSubscription: Subscription;

  readonly SEPARATOR_KEYS_CODES = [ENTER, COMMA, SEMICOLON, TAB, SPACE];

  allEmails: Set<string>;

  emails: Set<string>;

  emailForm: FormGroup;

  emailInput: FormControl;

  @Input() macro: Macro;

  constructor(private $macro: MacroService, private $fb: FormBuilder, private $appData: AppDataService) {

    $appData.emails()
      .subscribe(emails => this.allEmails = emails);

    this.emailInput = this.$fb.control("", [
      Validators.required
    ]);

    this.emailForm = this.$fb.group({
      subject: ["", Validators.required],
      text: ["", Validators.required]
    });

    this.emailForm
      .valueChanges
      .pipe(debounceTime(500))
      .subscribe(() => this._commitForm());


  }

  ngOnChanges() {
    if (this._dataSubscription) this._dataSubscription.unsubscribe();

    if (this.macro) {
      this._initForm(true);
      this._dataSubscription = this.macro.stateChanged().subscribe(() => this._initForm(true));
    }
  }

  private _commitForm() {
    this.macro.commitChanges({
      email_addresses: Array.from(this.emails),
      email_text: this.emailForm.get('text').value,
      email_subject: this.emailForm.get('subject').value
    });
  }

  private _initForm(locked: boolean=false) {
    this.emails = new Set(this.macro.state.email_addresses);
    this.emailForm.patchValue({
      subject: this.macro.state.email_subject,
      text: this.macro.state.email_text
    }, {emitEvent: !locked});
  }

  addEmail(value: string) {
    value = value.toLowerCase();
    for (let chunk of value.split(SEPARATOR_REGEXP))
      if (chunk.match(EMAIL_REGEXP)) {
        this.emails.add(chunk);
        this.$appData.addEmailAddress(value);
      }
    this._commitForm();
    this.emailInput.patchValue('');
  }

  removeEmail(value: string) {
    if (!this.emails.has(value)) return;
    this.emails.delete(value);
    this._commitForm();
  }

}
