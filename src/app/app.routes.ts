import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/user-list',
    pathMatch: 'full',
  },
  {
    path: 'user-list',
    loadComponent: () => import('./features/user-list/user-list').then((m) => m.UserListComponent),
  },
  {
    path: '**',
    redirectTo: '/user-list',
    pathMatch: 'full',
  },
];
