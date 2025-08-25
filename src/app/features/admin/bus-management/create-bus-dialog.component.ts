import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { Bus } from '../../../models/bus.model';

@Component({
  selector: 'app-create-bus-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './create-bus-dialog.component.html',
  styleUrls: ['./create-bus-dialog.component.scss']
})
export class CreateBusDialogComponent {
  busForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateBusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.busForm = this.fb.group({
      name: ['', Validators.required],
      totalSitting: [0, [Validators.required, Validators.min(1), Validators.max(32)]],
      sleeperTotal: [0, [Validators.required, Validators.min(0), Validators.max(15)]],
    });
  }

  get sittingSplit() {
    const maxTotal = 32;
    const total = Math.min(this.busForm.value.totalSitting, maxTotal);
    const left = Math.ceil(total / 2);
    const right = total - left;
    return { right, left };
  }

  get sleeperSplit() {
    const maxTotal = 15;
    const maxRight = 10;
    const maxLeft = 5;
    const total = Math.min(this.busForm.value.sleeperTotal, maxTotal);
    let right = Math.min(total, maxRight);
    let left = total - right;
    if (left > maxLeft) {
      left = maxLeft;
      right = total - left;
    }
    return { right, left };
  }

  onSubmit() {
    if (this.busForm.valid) {
      const form = this.busForm.value;
      const bus: Bus = {
        name: form.name,
        sitting: {
          left: { total: this.sittingSplit.left, seats: [] } as any,
          right: { total: this.sittingSplit.right, seats: [] } as any
        } as any,
        sleeper: { total: form.sleeperTotal, seats: [] } as any,
        ratings: 0
      };
      setTimeout(() => {
        this.dialogRef.close(bus);
      }, 1000);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
