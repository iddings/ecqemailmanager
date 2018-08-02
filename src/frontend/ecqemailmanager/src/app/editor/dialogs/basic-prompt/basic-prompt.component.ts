import {Component, Inject, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {MacroService} from "../../../macro/macro.service";

@Component({
  templateUrl: './basic-prompt.component.html'
})
export class BasicPromptComponent {

  value: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string,
      content: string,
      value: string
    }
  ) {
    this.value = data.value;
  }

}
