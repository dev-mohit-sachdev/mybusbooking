// app.routes.ts
import { Routes } from '@angular/router';
import { AdminAuthComponent } from './features/admin/admin-auth/admin-auth.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { MainComponent } from './features/admin/main/main.component';
import { BookingManagementComponent } from './features/admin/booking-management/booking-management.component';
import { BusManagementComponent } from './features/admin/bus-management/bus-management.component';
import { TripManagementComponent } from './features/admin/trip-management/trip-management.component';
import { UserManagementComponent } from './features/admin/user-management/user-management.component';
import { MantananceBlockedComponent } from './features/admin/mantanance-blocked/mantanance-blocked.component';
import { AuthComponent } from './features/user/auth/auth.component';

export const routes: Routes = [
    { path: '', component: AuthComponent },
  {
    path: 'admin',
    component: MainComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: AdminAuthComponent },
      { path: 'dashboard', component: DashboardComponent },
    { path: 'book-management', component: BookingManagementComponent },
    { path: 'bus-management', component: BusManagementComponent },
    { path: 'seat-management', component: MantananceBlockedComponent },
    { path: 'trip-management', component: TripManagementComponent },
    { path: 'user-management', component: UserManagementComponent }
    ]
  },

  { path: '**', redirectTo: '' } // fallback
];
