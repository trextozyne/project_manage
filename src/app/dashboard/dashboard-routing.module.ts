import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";
import {TaskManagementComponent} from "./task-management/task-management.component";

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard/tasks',
    pathMatch: 'full'
  },
  {
    path: '', children: [
      {
        path: 'tasks',
        component: TaskManagementComponent,
        // data: {
        //   title: 'login',
        //   breadcrumb: 'login'
        // }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
