import { Component } from '@angular/core';
import { Router } from '@angular/router';


import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-content-mid-center',
  templateUrl: './register.template.html',
  styleUrls: ['./register.style.less'],
  providers: [AuthService]
})
export class RegisterComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  public form = {
    name: '',
    account: '',
    pwd: '',
    pwd2: '',
    mail: ''
  };

  async onSubmit() {
    if (this.form['pwd'] !== this.form['pwd2']) {
      return;
    }

    const _resault = await this.authService.register(this.form);
  }
}
