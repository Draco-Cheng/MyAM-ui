import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { LoginForm } from './login.form';

import { AuthService, LoginFormData } from '../../service/auth.service';

@Component({
  selector: 'app-content-mid-center',
  templateUrl: './login.template.html',
  styleUrls: ['./login.style.less'],
  providers: [AuthService]
})
export class LoginComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  public form: LoginFormData = new LoginForm('', '', false);

  async onSubmit(): Promise<void> {
    await this.authService.login(this.form);
  }
}
