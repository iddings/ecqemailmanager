import { Injectable } from '@angular/core';
import {Observable, ReplaySubject, Subject} from "rxjs";
import {map} from "rxjs/operators";

import {MacroData} from "../models";
import {deepCopy} from "./helpers";
import {ApiService} from "../api/api.service";
import {updateState} from "./macro-state";
import {Task} from "../models";
import {ActivatedRoute, Router} from "@angular/router";


@Injectable()
export class MacroService {

  private _all: Macro[] = [];
  private _allSubject = new ReplaySubject<Macro[]>(1);

  constructor(private $api: ApiService, private $router: Router) {

    this.$api
      .allMacros()
      .subscribe(
        data => {
          this._all = data.map(m => new Macro(m));
          this._emitAll();
        },
        error => {
          this._emitAll();
        });

  }

  private _emitAll() {
    this._allSubject.next(this._all);
  }

  private _findMacro(id: number) {
    for (let macro of this._all)
      if (macro.state.id === id)
        return macro;
  }

  all = (): Observable<Macro[]> => this._allSubject;

  getMacro = (id: number) =>
    this.all()
      .pipe(map(all => {
        for (let macro of all)
            if (macro.state.id === id)
              return macro;
        return null;
      }));

  deleteMacro = (macro: Macro) =>
    this.$api.deleteMacro(macro.state.id)
      .pipe(
        map(() =>{
          this._all.splice(this._all.indexOf(macro), 1);
          this._emitAll();
          this.setCurrent();
        })
      );

  newMacro = (name: string) =>
    this.$api.newMacro(name)
      .pipe(
        map(data => {
          const macro = new Macro(data);
          this._all.push(macro);
          this._emitAll();
          return macro;
        })
      );

  saveMacro(macro: Macro) {
    macro._saving = true;
    this.$api.saveMacro(macro.state)
      .subscribe(newData => {
        macro._lastSavedNode = macro._stateNode;
        macro._saving = false;
      });
  }

  runMacro = (macro: Macro) =>
    this.$api.runMacro(macro.state.id);

  setCurrent(macro: Macro=null) {

    let url: any[] = [''];

    if (macro) {
      const slug = macro.state.name.toLowerCase().replace(/(?: |^)(.)/g, (_, y) => y.toUpperCase());
        url = ['r', slug, macro.state.id];
    }

    this.$router.navigate(url);

  }

}


class StateNode {

  public state: MacroData;

  constructor(
    state: MacroData,
    public previous?: StateNode,
    public next?: StateNode
  ) {
    if (previous) previous.next = this;
    this.state = deepCopy(state);
  }

}


export class Macro {

  _saving: boolean = false;
  _stateNode: StateNode;
  _lastSavedNode: StateNode;

  private _stateChanged = new Subject<MacroData>();

  get canRedoChanges() {return !!this._stateNode.next}
  get canUndoChanges() {return !!this._stateNode.previous}
  get canSaveChanges() {return !this._saving && this._stateNode !== this._lastSavedNode}

  constructor(public readonly state: MacroData) {
    this._stateNode = this._lastSavedNode = new StateNode(state);
  }

  commitChanges(changes: Partial<MacroData>, stateNode?: StateNode) {
    updateState(this.state, changes);
    this._stateNode = stateNode || new StateNode(this.state, this._stateNode);
    this._stateChanged.next(this.state);
  }

  stateChanged = (): Observable<MacroData> => this._stateChanged;

  redoChanges = () => this.commitChanges(this._stateNode.next.state, this._stateNode.next);
  undoChanges = () => this.commitChanges(this._stateNode.previous.state, this._stateNode.previous);

  addTask(task: Partial<Task>) {
    const tasks = deepCopy(this.state.tasks);
    task.task_seq = tasks.length + 1;
    tasks.push(task as Task);
    this.commitChanges({
      tasks: tasks
    });
  }

  removeTask(task: Task) {
    const tasks = deepCopy(this.state.tasks);
    tasks.splice(task.task_seq - 1, 1);
    this.commitChanges({
      tasks: tasks
    });
  }

}
