import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../service/auth.service';

import { AdminViewComponent } from './view/admin.view.component';

const routes: Routes = [{
  canActivate: [AuthGuard],
  path: 'admin',
  children: [{
    path: '',
    component: AdminViewComponent
  }]
}];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class ChildRoutingModule { }
