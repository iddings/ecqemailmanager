import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {AppDataService} from "../../../app-data/app-data.service";
import {ReportFile} from "../../../models";

@Component({
  templateUrl: './choose-report-file.component.html',
  styleUrls: ['./choose-report-file.component.scss']
})
export class ChooseReportFileComponent {

  users: string[];
  selectedUser: string;
  selectedUserReports: string[];
  selectedUserReport: string;

  existingReports: ReportFile[];
  selectedExistingReport: ReportFile;

  importMode: boolean = false;

  constructor(
    public $appData: AppDataService,
    private $dialogRef: MatDialogRef<ChooseReportFileComponent>,
    @Inject(MAT_DIALOG_DATA) data: {importNew?: boolean, selected?: string}
  ) {

    this.importMode = !!data.importNew;

    $appData.users()
      .subscribe(users => this.users = users);

    $appData.importedFiles()
      .subscribe(files => {
        this.existingReports = files;
        if (data.selected)
          for (let file of files)
            if (file.id === data.selected)
              this.selectedExistingReport = file;
      });

  }

  done() {
   if (this.importMode)
     this.$appData.importFile(this.selectedUser, this.selectedUserReport)
       .subscribe(file => this._close(file));
   else
     this._close(this.selectedExistingReport);
  }

  loadUserFiles(user) {
    this.$appData.userFiles(user)
      .subscribe(files => this.selectedUserReports = files);
  }

  existingReportSelectionChange(evt) {
    this.selectedExistingReport = evt.option.selected ? evt.option.value : undefined;
  }

  importReportSelectionChange(evt) {
    this.selectedUserReport = evt.option.selected ? evt.option.value : undefined;
  }

  private _close(report: ReportFile) {
    this.$dialogRef.close(report.id);
  }

}
