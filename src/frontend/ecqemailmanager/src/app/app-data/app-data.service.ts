import { Injectable } from '@angular/core';
import {ApiService} from "../api/api.service";
import {of} from "rxjs";
import {first, flatMap, map} from "rxjs/operators";
import {Observable} from "rxjs/internal/Observable";
import {ReplaySubject} from "rxjs/internal/ReplaySubject";
import {ReportFile} from "../models";



@Injectable()
export class AppDataService {

  private _emails = new ReplaySubject<Set<string>>(1);

  private _importedFiles = new ReplaySubject<ReportFile[]>();

  private _users = new ReplaySubject<string[]>();

  private _userFiles = new Map<string, string[]>();

  constructor(private $api: ApiService) {
    $api.appData()
      .subscribe(data => {
        this._users.next(data.users);
        this._importedFiles.next(data.report_files);
        this._emails.next(new Set(data.emails));
      });
  }

  addEmailAddress(email: string) {
    email = email.toLowerCase();
    this._emails
      .pipe(first())
      .subscribe(emails => {
        if (!emails.has(email)) {
          emails.add(email);
          this._emails.next(emails);
        }
      });
  }

  refreshReport = (reportFile: ReportFile) =>
    this.$api
      .reloadFile(reportFile);


  importFile = (user: string, report: string): Observable<ReportFile> =>
    this.$api
      .importFile(user, report)
      .pipe(

        flatMap(file => {
            return this.importedFiles()
              .pipe(
                map(existingFiles => {
                  for (let ef of existingFiles)
                    if (ef.id == file.id)
                      return ef;
                  existingFiles.push(file);
                  return file;
                })
              );
          }
        )
      );

  getImportedFile(id: string) {
    return this.importedFiles()
      .pipe(map(files => {
        for (let file of files)
          if (file.id === id)
            return file;
      }));
  }

  emails = (): Observable<Set<string>> => this._emails;

  importedFiles = (): Observable<ReportFile[]> => this._importedFiles;

  users = (): Observable<string[]> => this._users;

  userFiles(user: string): Observable<string[]> {

    if (this._userFiles.has(user))
      return of(this._userFiles.get(user));

    return this.$api
      .userFiles(user)
      .pipe(
        map(files => {
          this._userFiles.set(user, files);
          return files;
        })
      );

  }

}
