import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../service/auth.service';

import { DashboardComponent } from './dashboard.component';

const routes: Routes = [{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [AuthGuard]
}];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class ChildRoutingModule {}
