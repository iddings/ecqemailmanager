import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {Macro, MacroService} from "../../macro/macro.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Subscription} from "rxjs/internal/Subscription";
import {debounceTime} from "rxjs/operators";
import {DialogsService} from "../dialogs/dialogs.service";
import {ReportFile, Task} from "../../models";
import {AppDataService} from "../../app-data/app-data.service";

@Component({
  selector: 'editor-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnChanges {

  readonly FORMATS: {format: string, name: string}[] = [
    {format: '', name: ''},
    {format: 'html', name: 'HTML'},
    {format: 'pdf', name: 'PDF'},
    {format: 'xls', name: 'Excel'}
  ];

  private _dataSubscription: Subscription;
  private _formSubscription: Subscription;

  activeTaskSeq: number;

  @Input() macro: Macro;

  taskForm: FormGroup;

  reportFiles: ReportFile[];

  constructor(
    private $appData: AppDataService,
    private $fb: FormBuilder,
    public $dialog: DialogsService
  ) {
    this.$appData.importedFiles()
      .subscribe(files => this.reportFiles = files);
  }

  ngOnChanges() {
    if (this._dataSubscription) this._dataSubscription.unsubscribe();
        if (this.macro) {
          this._initForm();
          this._dataSubscription = this.macro.stateChanged()
            .subscribe(() => this._updateForm());
        }
  }

  private _commitForm() {

    const formData = this.taskForm.value,
      commitData = {
        tasks: []
      };

    for (let seq in formData)
      if (formData.hasOwnProperty(seq))
        commitData.tasks[parseInt(seq) - 1] = {
          report_file: formData[seq].reportFile,
          format: formData[seq].format,
          output_file: formData[seq].outputFile,
          task_seq: parseInt(seq)
        };

    this.macro.commitChanges(commitData);

  }

  private _initForm() {

    if (this._formSubscription) this._formSubscription.unsubscribe();

    const tasks = this.macro.state.tasks,
      formGroupDef = {};

    for (let task of tasks)
      formGroupDef[task.task_seq] = this.$fb.group({
        reportFile: [task.report_file, Validators.required],
        format: [task.format],
        outputFile: [task.output_file]
      });

    this.taskForm = this.$fb.group(formGroupDef);

    this._formSubscription = this.taskForm.valueChanges
      .pipe(debounceTime(500))
      .subscribe(() => this._commitForm());

    if (tasks.length) this.activeTaskSeq = tasks[0].task_seq;

  }

  private _updateForm() {

    const numTasksOld = Math.max(...Object.keys(this.taskForm.controls)
      .map(k => parseInt(k))
      .filter(k => !isNaN(k))),

      numTasksNew = this.macro.state.tasks.length;

    if (numTasksNew !== numTasksOld)
      return this._initForm();

    const tasks = this.macro.state.tasks,
      patchData = {};


    for (let task of tasks)
      patchData[task.task_seq] = {
        reportFile: task.report_file,
        format: task.format,
        outputFile: task.output_file
      };

    this.taskForm.patchValue(patchData, {emitEvent: false});

  }

  newTask() {
    this.$dialog.chooseReportFile()
      .afterClosed()
      .subscribe(file => {
        if (!file) return;
        this.macro.addTask({
          report_file: file,
          output_file: 'report',
          format: 'pdf'
        })
      })
  }

  changeReport(task: Task) {
    this.$dialog.chooseReportFile({selected: task.report_file})
      .afterClosed()
      .subscribe(file => {
        if (!file) return;
        const patchData = [];
        patchData[task.task_seq] = {
          reportFile: file
        };
        this.taskForm.patchValue(patchData)
      })
  }

  refreshReport(fileId: string) {

    this.$appData.getImportedFile(fileId)
      .subscribe(reportFile => {
        this.$dialog.confirm({
          title: 'Refresh Report?',
          content: `This will copy the most recent version of '${reportFile.source_file}' from ${reportFile.source_user}'s folder.`
        })
          .whenConfirmed
          .subscribe(() => {
            this.$appData
              .refreshReport(reportFile)
              .subscribe();
          });
      });

  }

}
