import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Bus } from '../../../models/bus.model';
import { BusService } from '../../../services/bus.service';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { MaintenanceSeatDialogComponent } from '../mantanance-blocked/maintenance-seat-dialog.component';
import { seatLabel } from '../../../helpers/seat-label';

@Component({
  selector: 'app-bus-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatRadioModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
  MatIconModule,
  MatDialogModule,
  MatTooltipModule
  ],
  templateUrl: './bus-details-dialog.component.html',
  styleUrls: ['./bus-details-dialog.component.scss']
})
export class BusDetailsDialogComponent {
  // expose Math to template (Angular template cannot access global Math directly)
  Math = Math;
  mode: 'view' | 'edit' = 'view';
  data!: Bus;
  // Seat rendering helpers
  getLeftSittingRows(count: number): string[][] {
    const rows: string[][] = [];
    let seatNum = 1;
    for (let i = 0; i < Math.ceil(count / 2); i++) {
      const row: string[] = [];
      for (let j = 0; j < 2 && seatNum <= count; j++) {
        row.push(`L${seatNum}`);
        seatNum++;
      }
      rows.push(row);
    }
    return rows;
  }

  getRightSittingRows(count: number): string[][] {
    const rows: string[][] = [];
    let seatNum = 1;
    for (let i = 0; i < Math.ceil(count / 2); i++) {
      const row: string[] = [];
      for (let j = 0; j < 2 && seatNum <= count; j++) {
        row.push(`R${seatNum}`);
        seatNum++;
      }
      rows.push(row);
    }
    return rows;
  }

  getLeftSleeperRows(bus: Bus): string[] {
    const leftCount = Math.min(bus.sleeper.total, 5);
    return Array.from({ length: leftCount }, (_, i) => `SL${i + 1}`);
  }

  getRightSleeperRows(bus: Bus): string[][] {
    const total = bus.sleeper.total;
    let rightCount = Math.min(total, 10);
    let leftCount = total - rightCount;
    if (leftCount > 5) {
      leftCount = 5;
      rightCount = total - leftCount;
    }
    const rows: string[][] = [];
    let seatNum = 1;
    for (let i = 0; i < Math.ceil(rightCount / 2); i++) {
      const row: string[] = [];
      for (let j = 0; j < 2 && seatNum <= rightCount; j++) {
        row.push(`SR${seatNum}`);
        seatNum++;
      }
      rows.push(row);
    }
    return rows;
  }
  // helper to compute number of rows to render for sitting view
  getSittingRowCount(bus: Bus): number {
    const left = this.getLeftSittingRows(bus.sitting.left.total).length;
    const right = this.getRightSittingRows(bus.sitting.right.total).length;
    return Math.max(left, right);
  }

  // simple range helper for templates
  range(n: number) {
    return Array.from({ length: Math.max(0, n) });
  }

  // convenience wrappers for template clarity
  leftSittingRows(bus: Bus) {
    return this.getLeftSittingRows(bus.sitting.left.total);
  }

  rightSittingRows(bus: Bus) {
    return this.getRightSittingRows(bus.sitting.right.total);
  }

  leftSleeperSeats(bus: Bus) {
    return this.getLeftSleeperRows(bus);
  }

  rightSleeperRows(bus: Bus) {
    return this.getRightSleeperRows(bus);
  }

  // return sleeper seat objects (left as array, right as rows of arrays) if available
  leftSleeperObjects(bus: Bus) {
    return bus.sleeper?.seats?.slice(0, Math.min(bus.sleeper.total || 0, 5)) || [];
  }

  rightSleeperObjectsRows(bus: Bus) {
    const total = bus.sleeper?.total || 0;
    let rightCount = Math.min(total, 10);
    const leftCount = Math.min(total, 5);
    const rows: import('../../../models/bus.model').Seat[][] = [];
    const rightSeats = bus.sleeper?.seats?.slice(leftCount, leftCount + rightCount) || [];
    // group rightSeats in pairs
    for (let i = 0; i < Math.ceil(rightSeats.length / 2); i++) {
      rows.push(rightSeats.slice(i*2, i*2+2));
    }
    return rows;
  }

  // Produce balanced display rows for sitting seats. If DB seat arrays are missing or inconsistent
  // generate virtual seat objects so left/right split is even (left = ceil(total/2)).
  sittingDisplayLeftRows(bus: Bus) {
    const total = (bus.sitting.left.total || 0) + (bus.sitting.right.total || 0);
    const leftTotal = bus.sitting.left.total || Math.ceil(total / 2);
    const leftSeats = (bus.sitting.left.seats && bus.sitting.left.seats.length === leftTotal)
      ? bus.sitting.left.seats
      : Array.from({ length: leftTotal }, (_, i) => ({ seatNo: i + 1 } as any));
    // group into pairs (2 seats per row)
    const rows: any[][] = [];
    for (let i = 0; i < Math.ceil(leftSeats.length / 2); i++) {
      rows.push(leftSeats.slice(i*2, i*2 + 2));
    }
    return rows;
  }

  sittingDisplayRightRows(bus: Bus) {
    const total = (bus.sitting.left.total || 0) + (bus.sitting.right.total || 0);
    const leftTotal = bus.sitting.left.total || Math.ceil(total / 2);
    const rightTotal = bus.sitting.right.total || (total - leftTotal);
    const start = leftTotal + 1;
    const rightSeats = (bus.sitting.right.seats && bus.sitting.right.seats.length === rightTotal)
      ? bus.sitting.right.seats
      : Array.from({ length: rightTotal }, (_, i) => ({ seatNo: start + i } as any));
    const rows: any[][] = [];
    for (let i = 0; i < Math.ceil(rightSeats.length / 2); i++) {
      rows.push(rightSeats.slice(i*2, i*2 + 2));
    }
    return rows;
  }

  // Balanced sleeper display: split sleepers evenly between SL and SR (left = ceil(total/2))
  sleeperDisplayLeftRows(bus: Bus) {
    const total = bus.sleeper?.total || 0;
    const leftTotal = Math.ceil(total / 2);
    const leftSeats = (bus.sleeper?.seats && bus.sleeper.seats.slice(0, leftTotal).length === leftTotal)
      ? bus.sleeper.seats.slice(0, leftTotal)
      : Array.from({ length: leftTotal }, (_, i) => ({ seatNo: i + 1 } as any));
    // SL: 1 seat per row
    const rows: any[][] = leftSeats.map(s => [s]);
    return rows;
  }

  sleeperDisplayRightRows(bus: Bus) {
    const total = bus.sleeper?.total || 0;
    const leftTotal = Math.ceil(total / 2);
    const rightTotal = total - leftTotal;
    const start = leftTotal + 1;
    const rightSeats = (bus.sleeper?.seats && bus.sleeper.seats.slice(leftTotal, leftTotal + rightTotal).length === rightTotal)
      ? bus.sleeper.seats.slice(leftTotal, leftTotal + rightTotal)
      : Array.from({ length: rightTotal }, (_, i) => ({ seatNo: start + i } as any));
    // SR: 2 seats per row
    const rows: any[][] = [];
    for (let i = 0; i < Math.ceil(rightSeats.length / 2); i++) {
      rows.push(rightSeats.slice(i*2, i*2 + 2));
    }
    return rows;
  }

  getSittingDisplayRowCount(bus: Bus) {
    const left = this.sittingDisplayLeftRows(bus).length;
    const right = this.sittingDisplayRightRows(bus).length;
    return Math.max(left, right);
  }

  getSleeperDisplayRowCount(bus: Bus) {
    const left = this.sleeperDisplayLeftRows(bus).length;
    const right = this.sleeperDisplayRightRows(bus).length;
    return Math.max(left, right);
  }
  
  // group left sleeper seats into rows of 2 for horizontal alignment (SL)
  leftSleeperObjectsRows(bus: Bus) {
    const leftSeats = this.leftSleeperObjects(bus) || [];
    const rows: import('../../../models/bus.model').Seat[][] = [];
    for (let i = 0; i < Math.ceil(leftSeats.length / 2); i++) {
      rows.push(leftSeats.slice(i*2, i*2+2));
    }
    return rows;
  }

  // row count for sleeper layout
  getSleeperRowCount(bus: Bus) {
    const left = this.leftSleeperObjectsRows(bus).length;
    const right = this.rightSleeperObjectsRows(bus).length;
    return Math.max(left, right);
  }
  viewType: 'sitting' | 'sleeper' = 'sitting';
  editMode = false;
  editForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private dialogRef: MatDialogRef<BusDetailsDialogComponent>,
    private fb: FormBuilder,
  private busService: BusService,
  private dialog: MatDialog
  ) {
    this.mode = dialogData?.mode || 'view';
    this.data = dialogData?.bus;
    this.editForm = this.fb.group({
      name: [this.data.name, Validators.required],
      totalSitting: [this.data.sitting.left.total + this.data.sitting.right.total, [Validators.required, Validators.max(32)]],
      sleeperTotal: [this.data.sleeper.total, [Validators.max(15)]],
    });
  }

  // helper to group seats by their row number
  groupSeatsByRow(seats?: import('../../../models/bus.model').Seat[]): import('../../../models/bus.model').Seat[][] {
    if (!seats || seats.length === 0) return [];
    const map = new Map<number, import('../../../models/bus.model').Seat[]>();
    for (const s of seats) {
      const r = s.row ?? 1;
      if (!map.has(r)) map.set(r, []);
      map.get(r)!.push(s);
    }
    return Array.from(map.keys()).sort((a,b)=>a-b).map(k => map.get(k) as import('../../../models/bus.model').Seat[]);
  }

  leftSeatRows(bus: Bus) {
    return this.groupSeatsByRow(bus.sitting?.left?.seats);
  }

  rightSeatRows(bus: Bus) {
    return this.groupSeatsByRow(bus.sitting?.right?.seats);
  }

  // open maintenance dialog for a seat
  openSeatDialog(seat: import('../../../models/bus.model').Seat, busId?: string) {
    if (!busId) busId = this.data.id;
    this.dialog.open(MaintenanceSeatDialogComponent, { width: '520px', data: { mode: 'edit', busId, seat } });
  }

  seatLabel(seat: any) { return seatLabel(seat); }

  get hasSleeper() {
    return this.data.sleeper.total > 0;
  }

  async saveEdit() {
    if (this.editForm.valid && this.data.id) {
      const form = this.editForm.value;
      // Use same split logic as modal
      const leftSitting = Math.ceil(form.totalSitting / 2);
      const rightSitting = form.totalSitting - leftSitting;
      let leftSleeper = Math.min(form.sleeperTotal, 5);
      let rightSleeper = form.sleeperTotal - leftSleeper;
      if (rightSleeper > 10) {
        rightSleeper = 10;
        leftSleeper = form.sleeperTotal - rightSleeper;
      }
      const payload: any = {
        name: form.name,
        sitting: {
          left: { total: leftSitting } as any,
          right: { total: rightSitting } as any
        } as any,
        sleeper: { total: form.sleeperTotal } as any
      };
      await this.busService.updateBus(this.data.id, payload);
      this.dialogRef.close(true);
    }
  }

  close() {
    this.dialogRef.close();
  }
}
