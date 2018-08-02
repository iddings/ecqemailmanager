import {MAT_DIALOG_DATA} from "@angular/material";
import {Component, Inject} from "@angular/core";

@Component({
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})
export class ProgressComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data) {}

}
