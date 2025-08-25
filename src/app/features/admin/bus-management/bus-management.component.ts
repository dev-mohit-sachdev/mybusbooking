// ...existing code...
import { Component } from '@angular/core';
import { Bus } from '../../../models/bus.model';
import { CreateBusDialogComponent } from './create-bus-dialog.component';
import { BusDetailsDialogComponent } from './bus-details-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { BusCardComponent } from '../../../shared/components/bus-card/bus-card.component';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { BusService } from '../../../services/bus.service';

@Component({
  selector: 'app-bus-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    BusCardComponent,
  ],
  templateUrl: './bus-management.component.html',
  styleUrls: ['./bus-management.component.scss'],
})
export class BusManagementComponent {
  buses$: Observable<Bus[]>;
  searchControl = new FormControl('');
  filteredBuses$: Observable<Bus[]>;

  isEdit = false;
  editIndex = -1;

  constructor(private dialog: MatDialog, private busService: BusService) {
    this.buses$ = this.busService.getBuses();
    this.filteredBuses$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      map((searchText: string | null) =>
        searchText
          ? []
          : []
      )
    );
    // We'll update filteredBuses$ after fetching buses
    this.buses$.subscribe(buses => {
      this.filteredBuses$ = this.searchControl.valueChanges.pipe(
        startWith(''),
        map((searchText: string | null) =>
          buses.filter((bus) =>
            bus.name.toLowerCase().includes((searchText ?? '').toLowerCase())
          )
        )
      );
    });
  }

  // Removed legacy form logic; modal handles bus creation

  openCreate(): void {
    const dialogRef = this.dialog.open(CreateBusDialogComponent, {
      width: '500px',
      data: {}
    });
    dialogRef.afterClosed().subscribe(async (result: Bus) => {
      if (result) {
        await this.busService.addBus(result);
        this.searchControl.setValue('');
        this.buses$ = this.busService.getBuses();
      }
    });
  }

  openBusDetails(bus: Bus): void {
    const dialogRef = this.dialog.open(BusDetailsDialogComponent, {
      width: '600px',
      data: { bus, mode: 'view' },
    });
    dialogRef.afterClosed().subscribe((updated: Bus | undefined) => {
      if (updated) {
        this.buses$ = this.busService.getBuses();
      }
    });
  }

  openEditBus(bus: Bus): void {
    const dialogRef = this.dialog.open(BusDetailsDialogComponent, {
      width: '600px',
      data: { bus, mode: 'edit' },
    });
    dialogRef.afterClosed().subscribe((updated: Bus | undefined) => {
      if (updated) {
        this.buses$ = this.busService.getBuses();
      }
    });
  }

  // Generate seat labels for left sitting (L1, L2, ...)
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

  // Generate seat labels for right sitting (R1, R2, ...)
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

  // Generate seat labels for left sleeper (SL1, SL2, ...)
  getLeftSleeperRows(bus: Bus): string[] {
    // Use the same split logic as modal: max 5 left, remainder right
    const leftCount = Math.min(bus.sleeper.total, 5);
    return Array.from({ length: leftCount }, (_, i) => `SL${i + 1}`);
  }

  // Generate seat labels for right sleeper (SR1, SR2, ...)
  getRightSleeperRows(bus: Bus): string[][] {
    // Use the same split logic as modal: max 10 right, remainder left
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
}
