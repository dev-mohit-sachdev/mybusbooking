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
import { AuthGuard } from './services/auth.guard';
import { SearchBusesComponent } from './features/user/search/search-buses.component';
import { ViewSeatsComponent } from './features/user/view-seats/view-seats.component';
import { PassengerDetailsComponent } from './features/user/passenger-details/passenger-details.component';
import { PaymentComponent } from './features/user/payment/payment.component';
import { BookingConfirmationComponent } from './features/user/booking-confirmation/booking-confirmation.component';

export const routes: Routes = [
    { path: '', component: AuthComponent },
  {
    path: 'admin',
    component: MainComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
        { path: 'login', component: AdminAuthComponent },
        { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: { role: 'admin' } },
      { path: 'book-management', component: BookingManagementComponent, canActivate: [AuthGuard], data: { role: 'admin' } },
      { path: 'bus-management', component: BusManagementComponent, canActivate: [AuthGuard], data: { role: 'admin' } },
      { path: 'seat-management', component: MantananceBlockedComponent, canActivate: [AuthGuard], data: { role: 'admin' } },
      { path: 'trip-management', component: TripManagementComponent, canActivate: [AuthGuard], data: { role: 'admin' } },
      { path: 'user-management', component: UserManagementComponent, canActivate: [AuthGuard], data: { role: 'admin' } }
    ]
  },

    // user-facing search page
    { path: 'search', component: SearchBusesComponent, canActivate: [AuthGuard], data: { role: 'user' } },
  { path: 'view-seats', component: ViewSeatsComponent, canActivate: [AuthGuard], data: { role: 'user' } },
    { path: 'passenger-details', component: PassengerDetailsComponent, canActivate: [AuthGuard], data: { role: 'user' } },
    { path: 'payment', component: PaymentComponent, canActivate: [AuthGuard], data: { role: 'user' } },
  { path: 'booking-confirmation', component: BookingConfirmationComponent, canActivate: [AuthGuard], data: { role: 'user' } },

  { path: '**', redirectTo: '' } // fallback
];
