import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {content} from "./shared/routes/content-routes";
import {ContentLayoutComponent} from "./shared/layout/content-layout/content-layout.component";
export const routes: Routes = [
  // {
  //   path: '',
  //   redirectTo: 'home/default',
  //   pathMatch: 'full'
  // },
  {
    path: '',
    component: ContentLayoutComponent,
    children: content
  },
  {
    path: '**',
    redirectTo: 'dashboard/tasks'
  }
];
