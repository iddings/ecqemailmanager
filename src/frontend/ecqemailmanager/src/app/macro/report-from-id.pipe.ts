import {ChangeDetectorRef, Pipe, PipeTransform} from '@angular/core';
import {AppDataService} from "../app-data/app-data.service";
import {ReportFile} from "../models";

@Pipe({
  name: 'reportFromId',
  pure: false
})
export class ReportFromIdPipe {

  private _latestReportFiles: ReportFile[];
  private _latestValue: ReportFile;
  private _latestId: string;

  constructor(private $appData: AppDataService, private _ref: ChangeDetectorRef) {
    $appData.importedFiles()
      .subscribe(files => {
        this._latestReportFiles = files;
        this._update();
      });
  }

  transform(id: string): any {
    this._latestId = id;
    this._update();
    return this._latestValue;
  }

  private _update() {
    if (!this._latestReportFiles || !this._latestId) return;
    for (let file of this._latestReportFiles)
      if (file.id === this._latestId)
        return this._latestValue = file;
    this._latestValue = null;
    this._ref.markForCheck();
  }

}
