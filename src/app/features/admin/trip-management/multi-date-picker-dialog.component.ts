import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-multi-date-picker-dialog',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatDatepickerModule, MatNativeDateModule, MatDialogModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-card class="picker-card">
      <mat-card-title>Select dates</mat-card-title>
      <mat-card-content>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Pick a date (picker will re-open for more)</mat-label>
          <input matInput [matDatepicker]="picker" (dateChange)="onDateSelected($event.value); picker.open()" />
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>
        <div class="selected-list" *ngIf="selectedArray.length">
          <div class="chip" *ngFor="let d of selectedArray">{{ d }}</div>
        </div>
      </mat-card-content>
      <mat-card-actions align="end">
        <button mat-button (click)="cancel()">Cancel</button>
        <button mat-stroked-button color="primary" (click)="done()">Done</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [
    `.picker-card { width: 360px; }
    .selected-list { display:flex; gap:8px; flex-wrap:wrap; margin-top:12px }
    .chip { background:#e3f2fd; padding:6px 10px; border-radius:16px; font-size:13px }
    `
  ]
})
export class MultiDatePickerDialogComponent {
  selected = new Set<string>();

  constructor(private dialogRef: MatDialogRef<MultiDatePickerDialogComponent>) {}

  get selectedArray() { return Array.from(this.selected); }

  onDateSelected(d: Date) {
    if (!d || isNaN(d.getTime())) return;
    const iso = d.toISOString().slice(0,10);
    if (this.selected.has(iso)) this.selected.delete(iso);
    else this.selected.add(iso);
  }

  done() { this.dialogRef.close(this.selectedArray); }
  cancel() { this.dialogRef.close(null); }
}
