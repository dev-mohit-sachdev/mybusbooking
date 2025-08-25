import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TripService } from '../../../services/trip.service';
import { BusService } from '../../../services/bus.service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { BusCardComponent } from '../../../shared/components/bus-card/bus-card.component';
import { Trip } from '../../../models/trip.model';
import { Bus } from '../../../models/bus.model';

@Component({
  selector: 'app-search-buses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule, MatIconModule, MatSelectModule],
  template: `
  <div class="search-hero">
    <mat-card class="filter-card">
      <form [formGroup]="filterForm" class="filter-form" (ngSubmit)="applyFilter()">
        <mat-form-field appearance="outline" class="input">
          <mat-label>From</mat-label>
          <mat-icon matPrefix>place</mat-icon>
          <input matInput formControlName="source" placeholder="City or station" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="input">
          <mat-label>To</mat-label>
          <mat-icon matPrefix>place</mat-icon>
          <input matInput formControlName="destination" placeholder="City or station" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="input date">
          <mat-label>Travel Date</mat-label>
          <mat-icon matPrefix>event</mat-icon>
          <input matInput [matDatepicker]="picker" formControlName="date" placeholder="Select date" />
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline" class="passenger">
          <mat-label>Adults</mat-label>
          <mat-icon matPrefix>person</mat-icon>
          <input matInput type="number" formControlName="adult" min="1" />
        </mat-form-field>

        <div class="actions">
          <button mat-flat-button color="primary" class="search-btn" (click)="applyFilter()">
            <mat-icon>search</mat-icon>
            Search
          </button>
          <button mat-stroked-button type="button" class="reset-btn" (click)="filterForm.reset({source:'',destination:'',date:null,adult:1}); results = [];">
            <mat-icon>autorenew</mat-icon>
            Reset
          </button>
        </div>
      </form>
    </mat-card>
  </div>

  <div class="results-grid">
    <div *ngIf="results.length === 0" class="no-results">No buses found — try broadening your search</div>

    <div class="grid">
      <mat-card class="result-card" *ngFor="let item of results; let i = index">
        <div class="result-inner">
          <div class="left">
            <div class="badge">
              <mat-icon class="bus-ico">directions_bus</mat-icon>
            </div>
            <div class="info">
              <div class="name">{{ item.bus.name || 'Unnamed Bus' }}</div>
              <div class="route">{{ item.trip.departure.name }} <span class="arrow">→</span> {{ item.trip.destination.name }}</div>
              <div class="meta">Available: <strong>{{ getAvailableSeats(item.bus) }}</strong></div>
            </div>
          </div>

          <div class="center">
            <div class="time-row">
              <div class="depart">{{ item.trip.departure.time }}</div>
              <div class="duration">{{ item.trip.durationMinutes ? (item.trip.durationMinutes/60 | number:'1.0-0') + 'h' : '—' }}</div>
              <div class="arrive">{{ computeArrivalForDateString(selectedIso, item.trip.departure.time, item.trip.durationMinutes) }}</div>
            </div>
            <div class="dates">
              <ng-container *ngFor="let d of item.trip.dates; let idx = index">
                <span class="date-pill">{{ d }}</span>
              </ng-container>
            </div>
          </div>

        <div class="right">
            <div class="prices">
              <div class="price-pill adult">Adult <span>{{ item.trip.pricing.adult }}</span></div>
              <div class="price-pill child">Child <span>{{ item.trip.pricing.child }}</span></div>
            </div>
            <div class="cta">
              <button mat-stroked-button color="primary" (click)="viewSeats(item)">View Seats</button>
            </div>
          </div>
        </div>
      </mat-card>
    </div>
  </div>
  `,
  styles: [
    `
    :host { display:block }
    .search-hero { padding: 20px 18px; display:flex; justify-content:center }
    .filter-card { width: 100%; max-width: 1200px; padding: 14px 18px; border-radius: 12px; box-shadow: 0 6px 30px rgba(2,6,23,0.06) }
    .filter-form { display:flex; gap:12px; align-items:center; flex-wrap:wrap }
    .input { flex: 1 1 240px }
    .date { max-width: 220px }
    .passenger { width: 120px }
    .actions { display:flex; gap:10px; align-items:center }
    .search-btn { display:flex; gap:8px; align-items:center; padding: 10px 18px; font-weight:600 }
    .reset-btn { display:flex; gap:8px; align-items:center }

    .results-grid { padding: 18px }
    .no-results { text-align:center; color:#666; padding: 40px 0 }
    .grid { display:grid; grid-template-columns: repeat(auto-fit,minmax(360px,1fr)); gap:18px }

    .result-card { padding: 12px; border-radius: 12px; overflow: hidden; transition: transform .18s ease, box-shadow .18s ease; box-shadow: 0 6px 24px rgba(17,24,39,0.04) }
    .result-card:hover { transform: translateY(-6px); box-shadow: 0 14px 40px rgba(17,24,39,0.08) }

    .result-inner { display:flex; gap:16px; align-items:center }
    .left { display:flex; gap:12px; align-items:center; min-width: 180px }
    .badge { width:64px; height:64px; background: linear-gradient(135deg,#1976d2 0%, #60a5fa 100%); border-radius:12px; display:flex; align-items:center; justify-content:center; box-shadow: 0 8px 20px rgba(25,118,210,0.12) }
    .bus-ico { color: #fff; font-size:28px }
    .info .name { font-weight:700; font-size:1.05rem; color:#0b3d91 }
    .route { color:#5a6b8a; font-size:0.95rem; margin-top:4px }
    .meta { margin-top:6px; color:#456; font-size:0.9rem }

    .center { flex: 1 1 auto }
    .time-row { display:flex; gap:12px; align-items:center; justify-content:flex-start; font-weight:600; color:#0b3d91 }
    .duration { color:#777; font-weight:500 }
    .arrive { color:#0b3d91 }
    .dates { margin-top:8px; display:flex; flex-wrap:wrap; gap:6px }
    .date-pill { background:#f1f5f9; padding:6px 10px; border-radius:999px; font-size:0.85rem; color:#1f2937 }

    .right { display:flex; flex-direction:column; align-items:flex-end; gap:10px; min-width:140px }
    .prices { display:flex; flex-direction:column; gap:8px; align-items:flex-end }
    .price-pill { padding:8px 12px; border-radius:10px; font-weight:700; display:flex; gap:8px; align-items:center }
    .price-pill span { background:transparent; color:#07203b; margin-left:6px }
    .price-pill.adult { background: linear-gradient(90deg,#fff7ed,#fff); color:#b45309 }
    .price-pill.child { background: linear-gradient(90deg,#eef2ff,#fff); color:#3730a3 }

    .cta { display:flex; gap:8px }

    @media(max-width:760px){
      .result-inner{ flex-direction:column; align-items:stretch }
      .right{ align-items:flex-start }
      .center { order: 3 }
    }

    @media(max-width:600px){
      .filter-form { flex-direction:column }
      .search-btn{ width:100% }
    }
    `
  ]
})
export class SearchBusesComponent implements OnInit {
  filterForm: any;
  trips: Trip[] = [];
  buses: Bus[] = [];
  results: Array<{ trip: Trip; bus: Bus }> = [];
  selectedIso = '';

  constructor(private fb: FormBuilder, private tripService: TripService, private busService: BusService, private router: Router) {
    this.filterForm = this.fb.group({ source: [''], destination: [''], date: [null], adult: [1] });
  }

  viewSeats(item: { trip: Trip; bus: Bus }) {
    // Navigate to view-seats page with query params for trip and bus
  const qp: any = { tripId: item.trip.id, busId: item.bus.id };
  if (this.selectedIso) qp.date = this.selectedIso;
  this.router.navigate(['/view-seats'], { queryParams: qp });
  }

  getAvailableSeats(bus?: Bus) {
    if (!bus) return 0;
    const left = (bus.sitting?.left?.seats || []).filter(s => !s.bookedBy && !s.blocked).length;
    const right = (bus.sitting?.right?.seats || []).filter(s => !s.bookedBy && !s.blocked).length;
    const sleeper = (bus.sleeper?.seats || []).filter(s => !s.bookedBy && !s.blocked).length;
    return left + right + sleeper;
  }

  ngOnInit() {
    this.tripService.list().subscribe(t => this.trips = t || []);
    this.busService.getBuses().subscribe(b => this.buses = b || []);
  }

  applyFilter() {
    const v = this.filterForm.value;
    const src = (v.source || '').trim().toLowerCase();
    const dst = (v.destination || '').trim().toLowerCase();
  const dateValue = v.date as Date | null | undefined;
  this.selectedIso = dateValue ? (dateValue as Date).toISOString().slice(0,10) : '';

    const filtered = this.trips.filter(t => {
      if (src && !(t.departure.name || '').toLowerCase().includes(src)) return false;
      if (dst && !(t.destination.name || '').toLowerCase().includes(dst)) return false;
      if (this.selectedIso && !(t.dates || []).includes(this.selectedIso)) return false;
      return true;
    });

    this.results = filtered.map(t => ({ trip: t, bus: this.buses.find(b => b.id === t.busId) || ({} as Bus) }));
  }

  computeArrivalForDateString(dateIso: string, departTime: string | undefined, durationMinutes?: number) {
    if (!dateIso) return '';
    const [dYear, dMonth, dDay] = dateIso.split('-').map(Number);
    const [h, m] = (departTime || '00:00').split(':').map(Number);
    const departDate = new Date(dYear, dMonth - 1, dDay, h || 0, m || 0);
    const totalMin = Number(durationMinutes || 0);
    const arrival = new Date(departDate.getTime() + totalMin * 60000);
    const hh = String(arrival.getHours()).padStart(2, '0');
    const mm = String(arrival.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
}
