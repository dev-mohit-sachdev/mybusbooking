import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
  <div class="wrap">
    <mat-card class="card">
      <h2>Booking Confirmed</h2>
      <div *ngIf="booking; else noBooking">
        <p>Your booking reference: <strong>{{ booking.id }}</strong></p>
        <p>Passengers: {{ booking.passengers.length }}</p>
  <p>Seats: {{ seatsString() }}</p>
  <p>Route: {{ booking.trip?.departure?.name }} → {{ booking.trip?.destination?.name }}</p>
  <p>Date: {{ booking.trip?.dates?.[0] }}</p>
        <div class="actions"><button mat-flat-button color="primary" (click)="goHome()">Back to Search</button></div>
      </div>
      <ng-template #noBooking><p>No booking data available.</p></ng-template>
    </mat-card>
  </div>
  `,
  styles: [`.wrap{display:flex;justify-content:center;padding:18px}.card{width:100%;max-width:800px;padding:16px}`]
})
export class BookingConfirmationComponent implements OnInit {
  booking: any = null;
  constructor(private router: Router) {
    const nav = (this.router.getCurrentNavigation && this.router.getCurrentNavigation()?.extras.state) || (window && (window as any).history?.state);
    this.booking = nav?.booking || null;
  }
  ngOnInit(): void {}
  goHome() { this.router.navigate(['/search']); }
  seatsString() { if (!this.booking) return ''; const sel = this.booking.selected; if (Array.isArray(sel) && sel.length) return sel.map((s:any)=>s.seatNo).join(', '); return ''; }
}
