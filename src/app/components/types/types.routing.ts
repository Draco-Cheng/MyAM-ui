import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../service/auth.service';

import { TypesViewComponent } from './view/types.view.component';

const routes: Routes = [{
  canActivate: [AuthGuard],
  path: 'types',
  children: [{
    path: '',
    component: TypesViewComponent
  }]
}];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class ChildRoutingModule { }
