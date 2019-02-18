import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../service/auth.service';

import { CurrencyViewComponent } from './view/currency.view.component';

const routes: Routes = [{
  canActivate: [AuthGuard],
  path: 'currency',
  children: [{
    path: '',
    component: CurrencyViewComponent
  }]
}];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class ChildRoutingModule { }
