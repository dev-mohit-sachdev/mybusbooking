import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BusService } from '../../../services/bus.service';
import { TripService } from '../../../services/trip.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-view-seats',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatGridListModule, MatChipsModule, MatToolbarModule, MatRippleModule],
  template: `
  <mat-toolbar color="primary" class="topbar">
    <button mat-icon-button (click)="goBack()"><mat-icon>arrow_back</mat-icon></button>
    <span class="title">Select Seats</span>
    <span class="spacer"></span>
    <button mat-icon-button aria-label="help"><mat-icon>help_outline</mat-icon></button>
  </mat-toolbar>

  <div class="container">
    <mat-card class="info-card">
      <div class="meta-row">
        <div class="bus-name">{{ bus?.name }}</div>
        <div class="route">{{ trip?.departure?.name }} → {{ trip?.destination?.name }}</div>
        <div class="time">{{ trip?.departure?.time }} — duration: {{ trip?.durationMinutes ? (trip.durationMinutes/60 | number:'1.0-0') + 'h' : '—' }}</div>
      </div>
    </mat-card>

    <div class="seat-area">
      <div class="legend">
        <mat-chip color="primary">Available</mat-chip>
        <mat-chip color="warn">Blocked</mat-chip>
        <mat-chip color="accent">Selected</mat-chip>
        <mat-chip>Ladies</mat-chip>
      </div>

      <div *ngIf="!bus" class="loading">Loading bus...</div>

      <div *ngIf="bus" class="layout">
        <div class="sitting">
          <div class="col left">
            <ng-container *ngFor="let seat of bus.sitting.left.seats; let idx = index">
              <div class="seat" [class.blocked]="seat.blocked" [class.selected]="isSelected(seat)" [class.ladies]="seat.reservedFor === 'female'"
                [class.booked]="dateIso && (seat.bookedDates || []).includes(dateIso) || (!dateIso && seat.bookedBy)"
                (click)="toggleSeat(seat)" matRipple>
                <div class="no">{{ seatLabel(seat, idx, 'left') }}</div>
              </div>
            </ng-container>
          </div>

          <div class="aisle"></div>

          <div class="col right">
            <ng-container *ngFor="let seat of bus.sitting.right.seats; let idx = index">
              <div class="seat" [class.blocked]="seat.blocked" [class.selected]="isSelected(seat)" [class.ladies]="seat.reservedFor === 'female'"
                [class.booked]="dateIso && (seat.bookedDates || []).includes(dateIso) || (!dateIso && seat.bookedBy)"
                (click)="toggleSeat(seat)" matRipple>
                <div class="no">{{ seatLabel(seat, idx, 'right') }}</div>
              </div>
            </ng-container>
          </div>
        </div>

        <div class="sleeper">
          <div class="sleeper-row">
            <ng-container *ngFor="let seat of bus.sleeper.seats; let idx = index">
              <div class="seat sleeper-seat" [class.blocked]="seat.blocked" [class.selected]="isSelected(seat)" [class.ladies]="seat.reservedFor === 'female'"
                [class.booked]="dateIso && (seat.bookedDates || []).includes(dateIso) || (!dateIso && seat.bookedBy)"
                (click)="toggleSeat(seat)" matRipple>
                <div class="no">{{ seatLabel(seat, idx, 'sleeper') }}</div>
              </div>
            </ng-container>
          </div>
        </div>

        <div class="selected-summary">
          <div>Selected seats: <strong>{{ selected.length }}</strong></div>
          <div class="selected-list"><span *ngFor="let s of selected">{{ s.seatNo }} </span></div>
        </div>
      </div>
    </div>

    <div class="actions-row">
      <button mat-stroked-button color="primary" (click)="clearSelection()">Clear</button>
      <button mat-flat-button color="accent" (click)="confirm()" [disabled]="selected.length === 0">Confirm</button>
    </div>
  </div>
  `,
  styles: [
    `
    :host { display:block }
    .topbar { position: sticky; top:0; z-index:2 }
    .container{ padding:18px; max-width:1100px; margin:0 auto }
    .info-card{ padding:12px; margin-bottom:12px }
    .meta-row{ display:flex; gap:12px; align-items:center }
    .bus-name{ font-weight:700; color:#0b3d91 }
    .route{ color:#4b5563 }
    .time{ margin-left:auto; color:#374151 }

    .seat-area{ background:#fff; padding:12px; border-radius:10px; box-shadow: 0 8px 30px rgba(2,6,23,0.04) }
    .legend{ display:flex; gap:8px; margin-bottom:12px }

    .layout{ display:flex; flex-direction:column; gap:12px }
    .sitting{ display:flex; gap:18px; align-items:flex-start }
    .col{ display:flex; flex-direction:column; gap:8px }
    .aisle{ width:40px }

    .seat{ width:56px; height:46px; border-radius:8px; background:#f8fafc; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow: 0 6px 18px rgba(15,23,42,0.04); transition: transform .12s, box-shadow .12s }
    .seat:hover{ transform: translateY(-4px) }
    .seat.selected{ background: linear-gradient(90deg,#34d399,#10b981); color:white }
    .seat.blocked{ background:#fef2f2; color:#b91c1c; cursor:not-allowed; opacity:0.9 }
    .seat.ladies{ box-shadow: inset 0 0 0 3px rgba(236,72,153,0.08) }
    .seat .no{ font-weight:700 }

    .sleeper-row{ display:flex; gap:8px; flex-wrap:wrap }
    .sleeper-seat{ width:84px; height:56px; border-radius:8px }

    .selected-summary{ margin-top:8px; display:flex; gap:12px; align-items:center }
    .actions-row{ display:flex; justify-content:flex-end; gap:12px; margin-top:12px }

    @media(max-width:760px){ .seat{ width:46px; height:40px } .aisle{ width:20px } .container{ padding:12px } }
    `
  ]
})
export class ViewSeatsComponent implements OnInit {
  bus: any;
  trip: any;
  selected: Array<any> = [];
  dateIso?: string | null;

  constructor(private route: ActivatedRoute, private router: Router, private busService: BusService, private tripService: TripService) {}

  busId?: string | null;
  tripId?: string | null;

  async ngOnInit(): Promise<void> {
  this.busId = this.route.snapshot.queryParamMap.get('busId');
  this.tripId = this.route.snapshot.queryParamMap.get('tripId');
  this.dateIso = this.route.snapshot.queryParamMap.get('date');
    if (this.busId) {
      try {
        const b = await this.busService.getBusById(this.busId);
        this.bus = b;
      } catch (err) {
        console.error('failed to load bus', err);
      }
    }
    if (this.tripId) {
      this.tripService.get(this.tripId).subscribe((t: any) => this.trip = t);
    }
  }

  toggleSeat(seat: any) {
    if (!seat || seat.blocked) return;
    // if seat is booked for this date, prevent selection
    const bookedDates = Array.isArray((seat as any).bookedDates) ? (seat as any).bookedDates : [];
    if (this.dateIso && bookedDates.includes(this.dateIso)) return;
    const idx = this.selected.findIndex(s => s.seatNo === seat.seatNo && s.type === seat.type && s.side === seat.side);
    if (idx >= 0) this.selected.splice(idx, 1);
    else this.selected.push(seat);
  }

  isSelected(seat: any) {
    return this.selected.findIndex(s => s.seatNo === seat.seatNo && s.type === seat.type && s.side === seat.side) >= 0;
  }

  clearSelection() { this.selected = []; }

  confirm() {
    // pass selected seats to passenger details page via navigation state
    if (!this.selected || this.selected.length === 0) return;
  this.router.navigate(['/passenger-details'], { state: { selected: this.selected, tripId: this.tripId, busId: this.busId, date: this.dateIso } });
  }

  goBack() { this.router.navigate(['/search']); }

  seatLabel(seat: any, index?: number, zone?: 'left' | 'right' | 'sleeper') {
    if (!seat) return '';
    // sitting left -> L1, L2... sitting right -> R1, R2...
    if (seat.type === 'sitting') {
      const side = seat.side || zone || 'left';
      const base = side === 'left' ? 'L' : 'R';
      // use row if present else fallback to seatNo
      const num = seat.row || seat.seatNo || (index !== undefined ? index + 1 : 0);
      return `${base}${num}`;
    }
    // sleeper -> SL1, SR1 (attempt to infer side by comparing index to half)
    if (seat.type === 'sleeper') {
      // if bus is available, try to split sleepers into two halves
      if (this.bus && this.bus.sleeper && Array.isArray(this.bus.sleeper.seats)) {
        const total = this.bus.sleeper.seats.length;
        const half = Math.ceil(total / 2);
        const idx = this.bus.sleeper.seats.findIndex((s: any) => s.seatNo === seat.seatNo);
        const side = idx >= half ? 'SR' : 'SL';
        const num = (idx % half) + 1;
        return `${side}${num}`;
      }
      return `SL${seat.row || seat.seatNo}`;
    }
    return String(seat.seatNo || '');
  }
}
