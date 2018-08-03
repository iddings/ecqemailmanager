import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Macro, MacroService} from "./macro/macro.service";
import {filter, first} from "rxjs/operators";
import {ActivatedRoute, Router} from "@angular/router";
import {ApiService} from "./api/api.service";
import {TokenService} from "./api/token.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;

  message: string;

  constructor(
    private $api: ApiService,
    private $router: Router,
    private $route: ActivatedRoute,
    private $tokens: TokenService,
    $fb: FormBuilder
  ) {
    this.loginForm = $fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.$tokens.whenTokensValid()
      .pipe(first())
      .subscribe(() => {
        this.$router.navigateByUrl(this.$route.snapshot.paramMap.get('next') || '');
      });
  }

  login() {
    if (this.loginForm.valid) {
      const formValue = this.loginForm.value;
      this.$api.login(
        formValue.username,
        formValue.password
      )
        .subscribe(resp => {
          if (!resp.success) this.message = resp.message;
        })
    }
  }

}
