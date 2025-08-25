import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { BusService } from '../../../services/bus.service';
import { Bus } from '../../../models/bus.model';

@Component({
  selector: 'app-booking-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './booking-management.component.html',
  styleUrls: ['./booking-management.component.scss']
})
export class BookingManagementComponent implements OnInit {
  buses: Bus[] = [];
  message = '';

  constructor(private busService: BusService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.busService.getBuses().subscribe(list => this.buses = list);
  }

  async checkAndBook(busId: string, seatNo: number) {
    // sample user for test - male age 30
    const user = { gender: 'male' as const, age: 30 };
    try {
      const res = await this.busService.canUserBookSeat(busId, seatNo, user);
      if (!res.allowed) {
        this.message = `Cannot book: ${res.reason}`;
        return;
      }
  await this.busService.updateSeatMetadata(busId, seatNo, { bookedBy: 'admin-test' });
      this.message = 'Seat booked (admin-test)';
    } catch (err: any) {
      this.message = err?.message || String(err);
    }
  }
}
