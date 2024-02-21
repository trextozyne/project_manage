import { Routes } from '@angular/router';

export const content: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('../../dashboard/dashboard-routing.module').then(m => m.DashboardRoutingModule),
  },
  // {
  //   path: 'login',
  //   loadChildren: () => import('../../components/auth/auth.module').then(m => m.AuthModule),
  // }
];
