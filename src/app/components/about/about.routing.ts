import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../service/auth.service';

import { AboutComponent } from './about.component';

const routes: Routes = [{
  canActivate: [AuthGuard],
  path: 'about',
  component: AboutComponent
}];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class ChildRoutingModule {}
