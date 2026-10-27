import { Routes } from '@angular/router';

import { Landing } from './pages/landing/landing';
import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';

import { DashboardLayout } from './layouts/dashboard-layout/dashboard-layout';
import { Overview } from './pages/dashboard/overview/overview';
import { Transactions } from './pages/dashboard/transactions/transactions';
import { Settings } from './pages/dashboard/settings/settings';
import { Budgets } from './pages/dashboard/budgets/budgets';
import { SavingsGoals } from './pages/dashboard/savings-goals/savings-goals';

import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { adminGuard } from './core/guards/admin.guard';

import { AdminLayout } from './layouts/admin/admin-layout/admin-layout';
import { AdminOverview } from './layouts/admin/admin-overview/admin-overview';
import { AdminUsers } from './layouts/admin/admin-users/admin-users';

import { Pnf } from './pages/pnf/pnf';

export const routes: Routes = [
  {
    path: '',
    component: Landing,
  },

  {
    path: 'login',
    component: Login,
    canActivate: [guestGuard],
  },

  {
    path: 'register',
    component: Register,
    canActivate: [guestGuard],
  },

  {
    path: 'dashboard',
    component: DashboardLayout,
    canActivate: [authGuard],
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
            path: 'budgets',
            component: Budgets,
          },
          {
            path: 'savings-goals',
            component: SavingsGoals,
          },
          {
            path: 'settings',
            component: Settings,
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
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        component: AdminOverview,
      },
      {
        path: 'users',
        component: AdminUsers,
      },
    ],
  },

  {
    path: '**',
    component: Pnf,
  },
];
