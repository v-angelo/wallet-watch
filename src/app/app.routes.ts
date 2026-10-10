import { Routes } from '@angular/router';

import { Landing } from './pages/landing/landing';
import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';

import { DashboardLayout } from './layouts/dashboard-layout/dashboard-layout';
import { Overview } from './pages/dashboard/overview/overview';
import { Transactions } from './pages/dashboard/transactions/transactions';

export const routes: Routes = [
  {
    path: '',
    component: Landing,
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'register',
    component: Register,
  },
  {
    path: 'dashboard',
    component: DashboardLayout,
    children: [
      {
        path: '',
        children: [
          {
            path: 'overview',
            component: Overview,
          },
          {
            path: 'transactions',
            component: Transactions,
          },
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'overview',
          },
        ],
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard/overview',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
