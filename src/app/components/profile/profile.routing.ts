import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../service/auth.service';

import { ProfileViewComponent } from './view/profile.view.component';

const routes: Routes = [{
  canActivate: [AuthGuard],
  path: 'profile',
  children: [{
    path: '',
    component: ProfileViewComponent
  }]
}];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class ChildRoutingModule { }
