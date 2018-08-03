import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {Macro, MacroService} from "./macro/macro.service";
import {DialogsService} from "./editor/dialogs/dialogs.service";
import {ActivatedRoute} from "@angular/router";
import {ApiService} from "./api/api.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit{

  allMacros: Observable<Macro[]>;
  macro: Macro;

  constructor(
    public $dialog: DialogsService,
    public $macro: MacroService,
    private $route: ActivatedRoute,
    private $api: ApiService
  ) {
    this.allMacros = $macro.all();
  }

  ngOnInit() {
    this.$route.data.subscribe((data: {macro: Macro}) => {
      this.macro = data.macro;
    });
  }

  newMacro() {

    this.$dialog.basicPrompt({
      title: "Create New Distribution",
      content: "Distribution Name"
    })
      .whenCompleted
      .subscribe(name => {
        this.$macro.newMacro(name)
          .subscribe(macro => this.$macro.setCurrent(macro))
      })

  }

  logout() {
    this.$dialog.confirm({
      title: 'Confirm',
      content: 'Are you sure you want to logout?'
    })
      .whenConfirmed
      .subscribe(() => this.$api.logout().subscribe(() => {
        location.reload();
      }))
  }

}
