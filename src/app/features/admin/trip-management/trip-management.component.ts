import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { TripService } from '../../../services/trip.service';
import { Trip } from '../../../models/trip.model';
import { Observable } from 'rxjs';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TripDialogComponent } from './trip-dialog.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-trip-management',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatInputModule, MatIconModule, MatButtonModule, MatPaginatorModule, MatSortModule, FormsModule],
  templateUrl: './trip-management.component.html',
  styleUrls: ['./trip-management.component.scss']
})
export class TripManagementComponent implements OnInit {
  displayedColumns = ['busId', 'departure', 'destination', 'pricing', 'dates', 'operator', 'actions'];
  dataSource = new MatTableDataSource<Trip>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private tripService: TripService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.tripService.list().subscribe(list => {
      this.dataSource.data = list;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(value: string) {
    this.dataSource.filter = (value || '').trim().toLowerCase();
  }

  create() {
    const ref = this.dialog.open(TripDialogComponent, { width: '720px', data: { mode: 'create' } });
    ref.afterClosed().subscribe((res: Trip|undefined) => {
      if (res) this.tripService.add(res);
    });
  }

  edit(row: Trip) {
    const ref = this.dialog.open(TripDialogComponent, { width: '720px', data: { mode: 'edit', trip: row } });
    ref.afterClosed().subscribe((res: Trip|undefined) => {
      if (res && row.id) this.tripService.update(row.id, res);
    });
  }

  view(row: Trip) {
    this.dialog.open(TripDialogComponent, { width: '720px', data: { mode: 'view', trip: row } });
  }

  remove(row: Trip) {
    if (!row.id) return;
    if (confirm('Delete this trip?')) this.tripService.delete(row.id);
  }
}
