import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { BusService } from '../../../services/bus.service';
import { Seat, Bus } from '../../../models/bus.model';
import { Subscription } from 'rxjs';
import { seatLabel } from '../../../helpers/seat-label';

type Mode = 'create' | 'view' | 'edit';

@Component({
  selector: 'app-maintenance-seat-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './maintenance-seat-dialog.component.html',
  styleUrls: ['./maintenance-seat-dialog.component.scss']
})
export class MaintenanceSeatDialogComponent {
  mode: Mode = 'view';
  form: FormGroup;
  buses: Bus[] = [];
  seatsForBus: Seat[] = [];
  private sub = new Subscription();

  constructor(
    private fb: FormBuilder,
    private busService: BusService,
    private dialogRef: MatDialogRef<MaintenanceSeatDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      busId: ['', Validators.required],
      seatNo: [null, Validators.required],
      reservedFor: ['none', Validators.required],
      blocked: [false]
    });

    this.mode = data?.mode || 'view';
    if (data?.mode === 'edit' || data?.mode === 'view') {
      const seat: Seat = data.seat;
  this.form.patchValue({ busId: data.busId || '', seatNo: seat.seatNo, reservedFor: seat.reservedFor || 'none', blocked: !!seat.blocked });
    }

    // load buses and watch bus selection to populate seats
  // ensure existing bus documents have seat arrays
  this.busService.backfillAllBuses().catch(() => {});

  const s = this.busService.getBuses().subscribe(list => {
      this.buses = list;
      const selectedId = this.form.get('busId')?.value;
      this.populateSeatsForBus(selectedId);
    });
    this.sub.add(s);

    const s2 = this.form.get('busId')?.valueChanges.subscribe((id: string) => this.populateSeatsForBus(id));
    if (s2) this.sub.add(s2);
  }

  // helper for template
  seatLabel(seat: Seat) {
    return seatLabel(seat);
  }

  populateSeatsForBus(busId: string | null | undefined) {
    this.seatsForBus = [];
    if (!busId) return;
    const found = this.buses.find(b => b.id === busId);
    if (!found) return;
    const seats: Seat[] = [];
    found.sitting?.left?.seats?.forEach(s => seats.push(s));
    found.sitting?.right?.seats?.forEach(s => seats.push(s));
    found.sleeper?.seats?.forEach(s => seats.push(s));
    this.seatsForBus = seats;
  }

  close(result?: any) {
    this.dialogRef.close(result);
  }

  async save() {
    if (this.mode === 'view') return this.close();
    if (this.form.invalid) return;
    const v = this.form.value as { busId: string; seatNo: string; reservedFor: string; blocked: boolean };
    // update seat metadata
  await this.busService.updateSeatMetadata(v.busId!, +v.seatNo!, { reservedFor: v.reservedFor as 'none' | 'female' | 'maintenance', blocked: !!v.blocked });
    this.close({ saved: true });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
