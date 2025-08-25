import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { BusService } from '../../../services/bus.service';
import { Bus, Seat } from '../../../models/bus.model';
import { MaintenanceSeatDialogComponent } from './maintenance-seat-dialog.component';
import { seatLabel } from '../../../helpers/seat-label';

@Component({
  selector: 'app-mantanance-blocked',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatTooltipModule],
  templateUrl: './mantanance-blocked.component.html',
  styleUrls: ['./mantanance-blocked.component.scss']
})
export class MantananceBlockedComponent implements OnDestroy {
  displayedColumns = ['busName', 'seatNo', 'label', 'type', 'reservedFor', 'blocked', 'actions'];
  data: Array<{ busId: string; busName: string; seat: Seat }> = [];
  private sub = new Subscription();

  constructor(private busService: BusService, private dialog: MatDialog) {
    const s = this.busService.getBuses().subscribe((buses: Bus[]) => {
      const rows: Array<{ busId: string; busName: string; seat: Seat }> = [];
      for (const b of buses) {
        const pushSeat = (seat: Seat | undefined) => {
          if (!seat) return;
          if (seat.blocked || (seat.reservedFor && seat.reservedFor !== 'none')) {
            rows.push({ busId: b.id as string, busName: b.name, seat });
          }
        };

        b.sitting?.left?.seats?.forEach(s => pushSeat(s));
        b.sitting?.right?.seats?.forEach(s => pushSeat(s));
        b.sleeper?.seats?.forEach(s => pushSeat(s));
      }
      this.data = rows;
    });
    this.sub.add(s);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  openCreate() {
    const ref = this.dialog.open(MaintenanceSeatDialogComponent, { data: { mode: 'create' }, width: '520px' });
    ref.afterClosed().subscribe();
  }

  openView(row: { busId: string; busName: string; seat: Seat }) {
    this.dialog.open(MaintenanceSeatDialogComponent, { data: { mode: 'view', busId: row.busId, seat: row.seat }, width: '520px' });
  }

  openEdit(row: { busId: string; busName: string; seat: Seat }) {
    const ref = this.dialog.open(MaintenanceSeatDialogComponent, { data: { mode: 'edit', busId: row.busId, seat: row.seat }, width: '520px' });
    ref.afterClosed().subscribe();
  }

  async delete(row: { busId: string; busName: string; seat: Seat }) {
    if (!confirm(`Delete maintenance for seat ${row.seat.seatNo} in ${row.busName}?`)) return;
    await this.busService.updateSeatMetadata(row.busId, row.seat.seatNo, { reservedFor: 'none', blocked: false });
  }

  // helper for template
  seatLabel(seat: Seat) {
    return seatLabel(seat);
  }
}
