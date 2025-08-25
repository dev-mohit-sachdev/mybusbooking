import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { BusService } from '../../../services/bus.service';
import { Bus } from '../../../models/bus.model';
import { MatCardModule } from '@angular/material/card';
import { Trip } from '../../../models/trip.model';

@Component({
  selector: 'app-trip-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatDatepickerModule, MatNativeDateModule, MatSelectModule, MatCardModule, MatDialogModule],
  templateUrl: './trip-dialog.component.html',
  styleUrls: ['./trip-dialog.component.scss']
})
export class TripDialogComponent {
  form = null as any;

  mode: 'create' | 'edit' | 'view' = 'create';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TripDialogComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { mode: string; trip?: Trip },
    private busService: BusService
  ) {
    this.mode = (data?.mode as any) || 'create';
    this.form = this.fb.group({
      busId: ['', Validators.required],
      departureName: ['', Validators.required],
      // time-only (HH:mm) input — user picks a time once
      departureTime: ['', Validators.required],
      destinationName: ['', Validators.required],
      // duration that will be applied to every selected date
      durationHours: [0, [Validators.min(0)]],
      durationMinutes: [0, [Validators.min(0), Validators.max(59)]],
      adult: [0, [Validators.required, Validators.min(0)]],
      child: [0, [Validators.required, Validators.min(0)]],
      dates: ['', Validators.required],
      operator: ['', Validators.required]
    });
    if (data?.trip) this.populate(data.trip);
  }

  buses: Bus[] = [];

  // selectedDates stores objects: { date: 'YYYY-MM-DD', departTime: 'HH:mm', arriveTime: 'HH:mm' }
  selectedDates: Array<{ date: string; departTime: string; arriveTime: string }> = [];

  // load buses for dropdown

  populate(trip: Trip) {
    this.form.patchValue({
      busId: trip.busId,
      departureName: trip.departure.name,
      departureTime: trip.departure.time,
      destinationName: trip.destination.name,
      adult: trip.pricing.adult,
      child: trip.pricing.child,
      dates: trip.dates.join(', '),
      operator: trip.operator
    });
    // build selectedDates objects. If trip.dates are plain strings, compute arrival using current form values
    const hours = Number(this.form.get('durationHours')?.value || 0);
    const mins = Number(this.form.get('durationMinutes')?.value || 0);
    const depart = this.form.get('departureTime')?.value || '00:00';
    const rawDates = trip.dates || [];
    this.selectedDates = rawDates.map(d => {
      if (d && typeof d === 'object' && (d as any).date) return d as any;
      const ds = String(d || '');
      const arrive = this.computeArrivalForDateString(ds, depart, hours, mins);
      return { date: ds, departTime: depart, arriveTime: arrive };
    });
    this.form.get('dates')!.setValue(this.selectedDates.map(s => s.date).join(', '));
  if (this.mode === 'view') this.form.disable();
  }

  ngOnInit() {
    this.busService.getBuses().subscribe(b => this.buses = b || []);
  }

  async openMultiDatePicker() {
    // dynamically import the dialog component so the compiler doesn't complain about unused entry
    import('./multi-date-picker-dialog.component').then(m => {
      const dr = this.dialog.open(m.MultiDatePickerDialogComponent);
      dr.afterClosed().subscribe((res: string[] | null) => {
      if (!res || !Array.isArray(res) || !res.length) return;
      const depart = this.form.get('departureTime')?.value || '00:00';
      const hours = Number(this.form.get('durationHours')?.value || 0);
      const mins = Number(this.form.get('durationMinutes')?.value || 0);
      for (const iso of res) {
        if (!this.selectedDates.find(s => s.date === iso)) {
          const arrive = this.computeArrivalForDateString(iso, depart, hours, mins);
          this.selectedDates.push({ date: iso, departTime: depart, arriveTime: arrive });
        }
      }
      this.form.get('dates')!.setValue(this.selectedDates.map(s => s.date).join(', '));
      });
    });
  }

  addDate(d: any, inputEl?: any) {
    if (!d) return;
    // support passing the input element or a Date
    let val: any = d;
    if (d?.value !== undefined) val = d.value;
    let date: Date | null = null;
    if (val instanceof Date) date = val;
    else if (typeof val === 'string' && val) date = new Date(val);
    if (!date || isNaN(date.getTime())) return;
    const iso = date.toISOString().slice(0,10);
    const depart = this.form.get('departureTime')?.value || '00:00';
    const hours = Number(this.form.get('durationHours')?.value || 0);
    const mins = Number(this.form.get('durationMinutes')?.value || 0);
    const arrive = this.computeArrivalForDateString(iso, depart, hours, mins);
    if (!this.selectedDates.find(s => s.date === iso)) {
      this.selectedDates.push({ date: iso, departTime: depart, arriveTime: arrive });
    }
    this.form.get('dates')!.setValue(this.selectedDates.map(s => s.date).join(', '));
    // clear the input so the picker opens blank next time
    try { if (inputEl) inputEl.value = ''; } catch(_) {}
  }

  onAddClicked(dateInput: any, picker: any) {
    // if input has no value, open the picker UI
  const val = dateInput?.value;
  if (!val) { picker.open(); return; }
  this.addDate(val);
  }

  removeDate(date: string) {
    this.selectedDates = this.selectedDates.filter(d => d.date !== date);
    this.form.get('dates')!.setValue(this.selectedDates.map(s => s.date).join(', '));
  }

  save() {
    if (this.form.valid) {
      const v = this.form.value;
      const payload: Trip = {
        busId: v.busId || '',
        departure: { name: v.departureName || '', time: v.departureTime || '' },
        destination: { name: v.destinationName || '', time: '' },
        pricing: { adult: Number(v.adult) || 0, child: Number(v.child) || 0 },
  dates: this.selectedDates.map(s => s.date),
        operator: v.operator || ''
      };
      this.dialogRef.close(payload);
    }
  }

  computeArrivalForDateString(dateIso: string, departTime: string, hours: number, minutes: number) {
    // dateIso expected 'YYYY-MM-DD'
    const [dYear, dMonth, dDay] = dateIso.split('-').map(Number);
    const [h, m] = (departTime || '00:00').split(':').map(Number);
    const departDate = new Date(dYear, dMonth - 1, dDay, h || 0, m || 0);
    const arrival = new Date(departDate.getTime() + (hours * 60 + minutes) * 60000);
    return this.toTimeString(arrival);
  }

  toTimeString(dt: Date) {
    const hh = String(dt.getHours()).padStart(2, '0');
    const mm = String(dt.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  close() { this.dialogRef.close(); }
}
