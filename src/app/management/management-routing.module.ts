import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";
//import { ManageListViewComponent } from "./managelistview/manage-list-view.component";

const routes: Routes = [
  {
    path: '',
    //component: ManageListViewComponent
  }
  // {
  //   path: '', children: [
  //     {
  //       path: 'login',
  //       component: AuthComponent,
  //       data: {
  //         title: 'login',
  //         breadcrumb: 'login'
  //       }
  //     }
  //   ]
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagementRoutingModule { }
