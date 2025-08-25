import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { TripService } from '../../../services/trip.service';
import { BusService } from '../../../services/bus.service';
import { BookingService } from '../../../services/booking.service';
import { environment, razorpayConfig } from '../../../../environments/environment';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatDividerModule, MatListModule],
  template: `
  <div class="wrap">
    <mat-card class="card">
      <h2>Payment Summary</h2>

      <div *ngIf="booking; else noBooking">
        <div class="grid">
          <!-- left: passenger details -->
          <div class="col left-col">
            <h3 class="section-title">Passengers</h3>
            <div *ngFor="let p of booking.passengers; let i = index" class="pass-card">
              <div class="pass-top">
                <div class="p-name">{{ p.name }}</div>
                <div class="p-fare">₹{{ fareFor(p) | number:'1.0-2' }}</div>
              </div>
              <div class="p-meta">Seat: <strong>{{ (booking.selected?.[i]?.seatNo) ? booking.selected[i].seatNo : p.seat }}</strong>
                • Age: {{ p.age }} • {{ p.category }}
              </div>
              <div class="p-contact">{{ p.email ? p.email + ' • ' : '' }}{{ p.phone || '' }}</div>
            </div>
          </div>

          <!-- right: trip and totals -->
          <div class="col right-col">
            <h3 class="section-title">Trip & Fare Details</h3>
            <div class="trip-card">
              <div style="font-size:12px;color:#9ca3af;margin-bottom:6px">Pricing present: {{ pricingAvailable() }}</div>
              <div class="trip-route">{{ trip?.departure?.name || '—' }} <span class="arrow">→</span> {{ trip?.destination?.name || '—' }}</div>
              <div class="trip-meta">Date: <strong>{{ trip?.dates?.[0] || '—' }}</strong></div>
              <div class="trip-meta">Departure: <strong>{{ trip?.departure?.time || '—' }}</strong></div>
              <div class="trip-meta">Duration: <strong>{{ trip?.durationMinutes ? (trip.durationMinutes/60 | number:'1.0-0') + 'h' : '—' }}</strong></div>
              <div class="trip-meta">Bus: <strong>{{ bus?.name || '—' }}</strong></div>
              <div class="trip-meta">Operator: <strong>{{ trip?.operator || '—' }}</strong></div>
              <div class="trip-meta">Selected Seats: <strong>{{ selectedSeatsString() }}</strong></div>
              <div class="trip-meta price-list" *ngIf="(trip && trip.pricing) || booking?.pricing; else noPricing">
                <div>Adult fare: <strong>₹{{ getAdultFare() | number:'1.0-2' }}</strong></div>
                <div>Child fare: <strong>₹{{ getChildFare() | number:'1.0-2' }}</strong></div>
              </div>
              <ng-template #noPricing><div class="trip-meta">Pricing not available</div></ng-template>
            </div>

            <div class="fare-box">
              <div class="row"><div>Subtotal</div><div>₹{{ subtotal | number:'1.0-2' }}</div></div>
              <div class="row total"><div>Total</div><div>₹{{ total | number:'1.0-2' }}</div></div>
            </div>

            <div class="actions-right">
              <button mat-stroked-button (click)="back()">Back</button>
              <button mat-flat-button color="primary" (click)="proceed()" [disabled]="!rzpKey">Proceed to Pay</button>
            </div>
            <div *ngIf="showKeyError" style="color:#b91c1c;margin-top:12px">Payment is not available: Razorpay key is not configured. Please contact the site admin.</div>
          </div>
        </div>
      </div>

      <ng-template #noBooking><p>No booking data provided.</p></ng-template>
    </mat-card>
  </div>
  `,
  styles:[`
    .wrap{padding:18px; display:flex; justify-content:center}
    .card{width:100%; max-width:1100px;padding:20px}
    .grid{display:grid;grid-template-columns:1fr 360px;gap:20px}
    @media(max-width:960px){ .grid{grid-template-columns:1fr} .right-col{order:2} }

    .section-title{margin:6px 0 12px 0;color:#0b3d91}

    /* passenger cards */
    .pass-card{background:#fbfcff;border-radius:8px;padding:12px;margin-bottom:12px;box-shadow:0 6px 20px rgba(2,6,23,0.03)}
    .pass-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
    .p-name{font-weight:700}
    .p-fare{font-weight:800;color:#0b3d91}
    .p-meta{color:#6b7280;font-size:13px}
    .p-contact{color:#4b5563;font-size:13px;margin-top:6px}

    /* trip card */
    .trip-card{background:#fff;border-radius:8px;padding:12px;margin-bottom:12px;box-shadow:0 6px 20px rgba(2,6,23,0.03)}
    .trip-route{font-weight:800;color:#07203b;margin-bottom:8px}
    .trip-meta{color:#6b7280;font-size:14px;margin:6px 0}

    .fare-box{background:linear-gradient(90deg,#fff,#f9fafb);border-radius:8px;padding:12px;margin-top:8px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.6)}
    .fare-box .row{display:flex;justify-content:space-between;padding:6px 0}
    .fare-box .total{font-weight:900;font-size:18px}

    .actions-right{display:flex;gap:12px;justify-content:flex-end;margin-top:12px}
  `]
})
export class PaymentComponent implements OnInit {
  booking: any;
  trip: any = null;
  bus: any = null;
  subtotal = 0;
  taxes = 0;
  total = 0;
  rzpKey: string | null = null;
  showKeyError = false;

  constructor(private router: Router, private tripService: TripService, private busService: BusService, private bookingService: BookingService) {
    const nav = (this.router.getCurrentNavigation && this.router.getCurrentNavigation()?.extras.state) || (window && (window as any).history?.state);
    this.booking = nav?.booking || null;
  }

  ngOnInit(): void {
    if (!this.booking) return;
    // allow booking to carry trip/pricing directly (fallback)
    if (this.booking.trip) { this.trip = this.booking.trip; }
    if (this.booking.pricing) { this.trip = { ...(this.trip || {}), pricing: this.booking.pricing }; }
  console.log('PaymentComponent: booking', this.booking);
    const tripId = this.booking.tripId;
    const busId = this.booking.busId;
  if (tripId) this.tripService.get(tripId).subscribe((t: any) => { console.log('PaymentComponent: trip loaded', t); this.trip = t; this.recalc(); });
  if (busId) this.busService.getBusById(busId).then(b => { console.log('PaymentComponent: bus loaded', b); this.bus = b; this.recalc(); }).catch(()=>{});
    this.recalc();

    // determine Razorpay key from several fallbacks so the component works even if environment shape changed
    const envKey = (environment as any)?.razorpay?.key || (environment as any)?.razorpayConfig?.key;
    const envExportKey = (razorpayConfig && (razorpayConfig as any).key) ? (razorpayConfig as any).key : null;
    const runtimeKey = (window as any)?.env?.RAZORPAY_KEY || (window as any)?.RZP_KEY || null;
    this.rzpKey = envKey || envExportKey || runtimeKey || null;
    if (!this.rzpKey) {
      console.error('Razorpay key not found. Set environment.razorpay.key or export razorpayConfig.key or provide window.env.RAZORPAY_KEY');
      this.showKeyError = true;
    }
  }

  fareFor(p: any) {
    // prefer trip.pricing, fallback to booking.pricing if provided
    const pricing = (this.trip && this.trip.pricing) || this.booking?.pricing || null;
    if (!pricing) return 0;
    const adultFare = Number(pricing.adult || 0);
    const childFare = Number(pricing.child || 0);
    const age = Number(p.age || 0);
    if (age < 14) return childFare;
    // 14-18: charged as adult
    return adultFare;
  }

  recalc() {
    if (!this.booking || !this.booking.passengers) { this.subtotal = 0; this.taxes = 0; this.total = 0; return; }
    this.subtotal = this.booking.passengers.reduce((s: number, p: any) => s + Number(this.fareFor(p) || 0), 0);
    // taxes removed per request
    this.taxes = 0;
    this.total = +(this.subtotal + this.taxes).toFixed(2);
  }

  selectedSeatsString() {
    if (!this.booking) return '';
    const sel = this.booking.selected;
    if (Array.isArray(sel) && sel.length) return sel.map((s: any) => s.seatNo).join(', ');
    if (Array.isArray(this.booking.passengers) && this.booking.passengers.length) return this.booking.passengers.map((p: any) => p.seat).join(', ');
    return '';
  }

  getAdultFare() {
    const pricing = (this.trip && this.trip.pricing) || this.booking?.pricing || null;
    return Number(pricing?.adult || 0);
  }

  getChildFare() {
    const pricing = (this.trip && this.trip.pricing) || this.booking?.pricing || null;
    return Number(pricing?.child || 0);
  }

  pricingAvailable() {
    const pricing = (this.trip && this.trip.pricing) || this.booking?.pricing || null;
    return !!pricing && (Number(pricing.adult) > 0 || Number(pricing.child) > 0);
  }

  back(){ this.router.navigate(['/passenger-details']); }

  proceed(){
    
    if (!this.rzpKey) {
      // defensive: block payment flow when key is missing
      this.showKeyError = true;
      console.error('Cannot proceed to payment: Razorpay key is undefined');
      return;
    }

    const options: any = {
      key: this.rzpKey,
      amount: Math.round(this.total * 100), // in paise
      currency: 'INR',
      name: this.bus?.name || 'MyBusBooking',
      description: 'Ticket booking',
      handler: async (response: any) => {
        
        try {
          
          const bookDate = this.booking.date || (this.trip && this.trip.dates && this.trip.dates[0]) || null;
          const payload = { ...this.booking, trip: this.trip, bus: this.bus, amount: this.total, payment: response, date: bookDate, createdAt: new Date().toISOString() };
          const docRef: any = await this.bookingService.create(payload);
          
          const seats = this.booking.selected || [];
          const userId = (window && (window as any).sessionStorage && (window as any).sessionStorage.getItem('mybusbooking-user')) || null;
          for (const s of seats) {
            try { await this.busService.markSeatBooked(this.booking.busId, s.seatNo, bookDate, userId || docRef.id); } catch (err) { console.warn('seat mark failed', err); }
          }
          // navigate to confirmation
          const bookingData = { id: docRef.id, ...payload };
          this.router.navigate(['/booking-confirmation'], { state: { booking: bookingData } });
        } catch (err) {
          console.error('booking persist failed', err);
        }
      },
      prefill: {
        name: this.booking.passengers?.[0]?.name || '',
        email: this.booking.passengers?.[0]?.email || ''
      }
    };

    // load Razorpay script if not present
    if (!(window as any).Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => { const rzp = new (window as any).Razorpay(options); rzp.open(); };
      document.body.appendChild(script);
    } else {
      const rzp = new (window as any).Razorpay(options); rzp.open();
    }
  }
}
